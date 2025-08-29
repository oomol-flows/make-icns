# Image to Icon Block

A simple block that converts images to icon format with customizable settings.

## Usage

### Basic Usage
```javascript
const imageToIcon = require('image-to-icon');

// Convert image to icon
const icon = await imageToIcon.convert('input.jpg', {
  size: 64,
  format: 'png'
});
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `size` | number | 32 | Icon size in pixels |
| `format` | string | 'png' | Output format (png, jpg, webp) |
| `quality` | number | 0.8 | Image quality (0-1) |
| `background` | string | 'transparent' | Background color |

## Installation

```bash
npm install image-to-icon
```

## API Reference

### `convert(source, options)`
Converts an image file to icon format.

**Parameters:**
- `source` (string): Path to source image
- `options` (object): Conversion options

**Returns:**
- Promise<string>: Path to generated icon file

## License

MIT