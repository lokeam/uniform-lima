export default function DataImportsPage() {
  return (
    <div>
      <h2>Data Imports</h2>

      <h3>Choose how to import your data</h3>

      {/* Card 1: Manual Upload */}
      <div data-id="manual-upload">
        <div>
          <div>📁</div>
          <div>Manual Upload</div>
          <div>Best for:</div>
          <ul>
            <li>Small data sets 1 - 10 files</li>
            <li>One-time imports</li>
          </ul>

          <button>Get Started!</button>
        </div>
      </div>

      {/* Card 2: Blob Storage Upload */}
      <div data-id="web-stroage-upload">
        <div>
          <div>☁️</div>
          <div>Connect to Web Storage</div>
          <div>Best for:</div>
          <ul>
            <li>Large data sets (100+ files)</li>
            <li>Self-hosted data</li>
            <li>Continuous imports</li>
          </ul>

          <button>Connect</button>
        </div>
      </div>

      {/* Card 3: API Import */}
      <div data-id="API Import">
        <div>
          <div>☁️</div>
          <div>API Import</div>
          <div>Best for:</div>
          <ul>
            <li>Large data sets (100+ files)</li>
            <li>Self-hosted data</li>
            <li>Continuous imports</li>
          </ul>

          <button>Setup</button>
        </div>
      </div>
    </div>
  )
}