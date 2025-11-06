# Bookmark Metadata API

Fetch website title and favicons from any URL. This API uses the `@reinforcezwei/favicon-fetcher` package to reliably extract metadata from websites.

## Endpoint

```
GET /api/bookmark/metadata
```

## Authentication

Requires authentication via `withAuth` middleware.

## Query Parameters

| Parameter | Type   | Required | Description                                    |
|-----------|--------|----------|------------------------------------------------|
| `url`     | string | Yes      | The website URL to fetch metadata from         |

## Response

### Success Response (200 OK)

```typescript
{
  url: string;              // The normalized URL that was fetched
  title: string;            // Page title (primary title for backward compatibility)
  titles: Array<{           // Array of all titles from multiple sources
    value: string;          // Title text
    source: string;         // Source type (html, opengraph, twitter, manifest)
    property: string;       // Property name (title, og:title, twitter:title, name, etc.)
  }>;
  icons: Array<{
    url: string;            // Original icon URL (for reference)
    type: string;           // Icon type (e.g., 'icon', 'apple-touch-icon', 'manifest-icon')
    sizes: string;          // Size attribute (e.g., '192x192', 'any')
    source: 'html' | 'manifest' | 'default';  // Where the icon was found
    base64: string;         // Base64 encoded image data (ready to use)
    mimeType: string;       // MIME type (e.g., 'image/png', 'image/svg+xml')
    metadata: {
      width: number;        // Image width in pixels
      height: number;       // Image height in pixels
      format: string;       // Image format (png, ico, jpeg, svg)
      size: number;         // File size in bytes
    }
  }>
}
```

### Error Responses

#### 400 Bad Request
```json
{
  "error": "URL parameter is required"
}
```

#### 401 Unauthorized
User is not authenticated.

#### 500 Internal Server Error
```json
{
  "error": "Failed to fetch website metadata",
  "message": "Detailed error message"
}
```

## Example Usage

### Request
```
GET /api/bookmark/metadata?url=https://github.com
```

### Response
```json
{
  "url": "https://github.com",
  "title": "GitHub: Let's build from here · GitHub",
  "titles": [
    {
      "value": "GitHub: Let's build from here · GitHub",
      "source": "html",
      "property": "title"
    },
    {
      "value": "GitHub",
      "source": "opengraph",
      "property": "og:title"
    },
    {
      "value": "GitHub",
      "source": "twitter",
      "property": "twitter:title"
    }
  ],
  "icons": [
    {
      "url": "https://github.githubassets.com/favicons/favicon.svg",
      "type": "icon",
      "sizes": "any",
      "source": "html",
      "base64": "PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQi...",
      "mimeType": "image/svg+xml",
      "metadata": {
        "width": 24,
        "height": 24,
        "format": "svg",
        "size": 1234
      }
    },
    {
      "url": "https://github.githubassets.com/favicons/favicon.png",
      "type": "apple-touch-icon",
      "sizes": "180x180",
      "source": "html",
      "base64": "iVBORw0KGgoAAAANSUhEUgAA...",
      "mimeType": "image/png",
      "metadata": {
        "width": 180,
        "height": 180,
        "format": "png",
        "size": 5678
      }
    }
  ]
}
```

## Client Usage

### JavaScript/TypeScript
```typescript
async function fetchBookmarkMetadata(url: string) {
  const response = await fetch(
    `/api/bookmark/metadata?url=${encodeURIComponent(url)}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch metadata');
  }
  
  return await response.json();
}

// Use the metadata
const metadata = await fetchBookmarkMetadata('https://example.com');
console.log('Primary Title:', metadata.title);

// Access all titles with source information
console.log('\nAll Titles:');
metadata.titles.forEach(title => {
  console.log(`- ${title.value} (from ${title.source}: ${title.property})`);
});

// Display icons using data URLs (no CORS issues!)
metadata.icons.forEach(icon => {
  const dataUrl = `data:${icon.mimeType};base64,${icon.base64}`;
  console.log(`Icon: ${icon.sizes} - ${dataUrl}`);
});
```

### React Component
```tsx
const [metadata, setMetadata] = useState(null);

useEffect(() => {
  async function loadMetadata() {
    const data = await fetch(
      `/api/bookmark/metadata?url=${encodeURIComponent(url)}`
    ).then(res => res.json());
    setMetadata(data);
  }
  loadMetadata();
}, [url]);

// Render icon
{metadata?.icons[0] && (
  <img
    src={`data:${metadata.icons[0].mimeType};base64,${metadata.icons[0].base64}`}
    alt={metadata.title}
    width={metadata.icons[0].metadata.width}
    height={metadata.icons[0].metadata.height}
  />
)}
```

## Why Base64 Encoding?

Icons are returned as base64-encoded data URLs to solve common issues:

1. **CORS/Referer Blocking**: Many websites check the `Referer` header and block requests from different origins. By fetching icons server-side and encoding them as base64, the client can display them without making cross-origin requests.

2. **Reliability**: The icon data is fetched once on the server and guaranteed to be available to the client.

3. **Immediate Display**: No additional network requests needed from the client - icons can be displayed immediately.

## Title Detection

The API extracts titles from multiple sources with rich metadata:

1. **HTML `<title>` tag**: Standard page title
   - Source: `html`
   - Property: `title`

2. **OpenGraph title**: `<meta property="og:title">`
   - Source: `opengraph`
   - Property: `og:title`

3. **Twitter title**: `<meta name="twitter:title">`
   - Source: `twitter`
   - Property: `twitter:title`

4. **Web App Manifest**: `name` or `short_name` from `manifest.json`
   - Source: `manifest`
   - Property: `name` or `short_name`

All titles are returned in the `titles` array. The primary HTML title is also available in the `title` field for backward compatibility.

## Icon Detection Strategy

The API searches for icons in the following order:

1. **HTML `<link>` tags**: favicon, apple-touch-icon, etc.
2. **Web App Manifest** (`manifest.json`): Icons defined in the manifest
3. **Default Favicon**: `/favicon.ico` at the domain root
4. **OpenGraph Image**: `og:image` meta tag as a fallback

## Performance Considerations

- Default timeout: 10 seconds
- Always includes metadata (dimensions, format, file size)
- Filters out icons that failed to fetch
- Returns multiple icons for user selection
- Uses `file-type` package to detect MIME types from actual buffer data (more reliable than format strings)

## Related Files

- Implementation: `src/app/api/bookmark/metadata/route.ts`
- Package: `@reinforcezwei/favicon-fetcher`

