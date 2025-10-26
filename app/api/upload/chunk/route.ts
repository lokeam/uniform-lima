import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * Chunked Upload Handler
 *
 * This endpoint receives file chunks and stores them locally.
 * In production, this would be disabled or upload to S3/R2.
 *
 * User Flow:
 * 1. Client splits file into chunks using FileReader API
 * 2. Each chunk is sent with metadata (uploadId, chunkIndex, etc.)
 * 3. Server writes each chunk to disk
 * 4. Client calls /finalize when all chunks are uploaded
 */

export async function POST(request: NextRequest) {
  // Disable in prod unless explictly enabled
  if (process.env.NODE_ENV === 'production' && process.env.ENABLE_UPLOADES !== 'true') {
    return NextResponse.json(
      { error: 'File uploads are disabled in production. Please run locally to test. '},
      { status: 403 }
    );
  }

  try {
    // Pull out metadata from headers
    const uploadId = request.headers.get('x-upload-id');
    const chunkIndex = request.headers.get('x-chunk-index');
    const chunkCount = request.headers.get('x-chunk-count');
    const fileName = request.headers.get('x-file-name');

    if (!uploadId || chunkIndex === null || !fileName) {
      return NextResponse.json(
        { error: 'Missing required headers' },
        { status: 400 }
      )
    }

    // Create upload directory in .uploads/ (gitignored)
    const uploadDir = path.join(process.cwd(), '.uploads', uploadId);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Get chunk data as buffer
    const buffer = await request.arrayBuffer();
    const chunk = Buffer.from(buffer);

    // Write chunk to disk (idempotent - able to be called multiple times)
    const chunkPath = path.join(uploadDir, `chunk-${chunkIndex.padStart(5, '0')}`);
    fs.writeFileSync(chunkPath, chunk);

    console.log(`🧩 Chunk ${chunkIndex}/${chunkCount} received for ${fileName} (${chunk.length} bytes)`);

    return NextResponse.json({
      success: true,
      uploadId,
      chunkIndex: parseInt(chunkIndex),
      chunkCount: parseInt(chunkCount || '0'),
      bytesReceived: chunk.length,
    });
  } catch(error) {
    console.error('Chunk upload error: ', error);
    return NextResponse.json(
      { error: 'Failed to receive chunk'},
      { status: 500 }
    );
  }
}