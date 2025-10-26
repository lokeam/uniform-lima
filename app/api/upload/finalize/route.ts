import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * Finalize Upload Handler
 *
 * This endpoint assembles all chunks into the final file.
 *
 * Flow:
 * 1. Read all chunks from the upload directory
 * 2. Sort them by index
 * 3. Combine into final file
 * 4. Clean up chunks
 * 5. Schedule auto-deletion (for demo purposes)
 *
 * In production, this would upload to S3/R2 instead of local storage.
 */
export async function POST(request: NextRequest) {
  // Disable in production unless explicitly enabled
  if (process.env.NODE_ENV === 'production' && process.env.ENABLE_UPLOADS !== 'true') {
    return NextResponse.json(
      { error: 'File uploads are disabled in production. Run locally to test.' },
      { status: 403 }
    );
  }

  try {
    const { uploadId, fileName } = await request.json();

    if (!uploadId || !fileName) {
      return NextResponse.json(
        { error: 'Missing uploadId or fileName' },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), '.uploads', uploadId);

    if (!fs.existsSync(uploadDir)) {
      return NextResponse.json(
        { error: 'Upload not found' },
        { status: 404 }
      );
    }

    // Read all chunk files
    const chunkFiles = fs.readdirSync(uploadDir)
      .filter(f => f.startsWith('chunk-'))
      .sort(); // Already sorted by padded index

    if (chunkFiles.length === 0) {
      return NextResponse.json(
        { error: 'No chunks found' },
        { status: 400 }
      );
    }

    // Create final file path
    const finalDir = path.join(process.cwd(), '.uploads', 'completed');
    if (!fs.existsSync(finalDir)) {
      fs.mkdirSync(finalDir, { recursive: true });
    }

    const finalPath = path.join(finalDir, `${uploadId}-${fileName}`);

    // Combine chunks into final file
    const writeStream = fs.createWriteStream(finalPath);

    for (const chunkFile of chunkFiles) {
      const chunkPath = path.join(uploadDir, chunkFile);
      const chunkData = fs.readFileSync(chunkPath);
      writeStream.write(chunkData);
    }

    writeStream.end();

    // Wait for write to complete
    await new Promise<void>((resolve, reject) => {
      writeStream.on('finish', () => resolve());
      writeStream.on('error', (err) => reject(err));
    });

    // Get final file size
    const finalSize = fs.statSync(finalPath).size;

    // Clean up chunk directory
    fs.rmSync(uploadDir, { recursive: true });

    console.log(`✅ File assembled: ${fileName} (${finalSize} bytes)`);

    // Auto-delete after 5 minutes (for demo purposes)
    setTimeout(() => {
      if (fs.existsSync(finalPath)) {
        fs.unlinkSync(finalPath);
        console.log(`🗑️  Auto-deleted: ${fileName}`);
      }
    }, 5 * 60 * 1000);

    /*
     * PRODUCTION CODE (commented out for demo):
     *
     * Instead of storing locally, upload to S3/R2:
     *
     * import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
     *
     * const s3Client = new S3Client({
     *   region: 'auto',
     *   endpoint: process.env.R2_ENDPOINT,
     *   credentials: {
     *     accessKeyId: process.env.R2_ACCESS_KEY_ID,
     *     secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
     *   },
     * });
     *
     * await s3Client.send(new PutObjectCommand({
     *   Bucket: process.env.R2_BUCKET,
     *   Key: `uploads/${uploadId}/${fileName}`,
     *   Body: fs.createReadStream(finalPath),
     *   ContentType: fileType,
     * }));
     *
     * // Clean up local file
     * fs.unlinkSync(finalPath);
     */

    return NextResponse.json({
      success: true,
      fileName,
      fileSize: finalSize,
      uploadId,
      // In production, return the S3/R2 URL
      fileUrl: `/api/uploads/${uploadId}-${fileName}`,
    });
  } catch (error) {
    console.error('Finalize upload error:', error);
    return NextResponse.json(
      { error: 'Failed to finalize upload' },
      { status: 500 }
    );
  }
}