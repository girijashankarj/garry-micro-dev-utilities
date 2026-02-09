# Contributing to Garry OpenAPI Swagger Viewer

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/garry-micro-dev-utilities.git`
3. Create a branch: `git checkout -b feature/your-feature-name`

## Development Setup

No build step is required! Simply:

```bash
# Start a local server
python3 -m http.server 8080

# Open in browser
open http://localhost:8080
```

## Code Style

- Follow existing code style
- Use meaningful variable names
- Add comments for complex logic
- Keep the single-file structure (no build step)

## Testing

Before submitting:

1. Test in multiple browsers (Chrome, Firefox, Safari)
2. Test with different OpenAPI specs
3. Test error scenarios (invalid files, large files, etc.)
4. Test accessibility (keyboard navigation, screen readers)

## Submitting Changes

1. Ensure your code follows the project style
2. Test thoroughly
3. Update documentation if needed
4. Submit a pull request with a clear description

## Reporting Issues

When reporting issues, please include:
- Browser and version
- Steps to reproduce
- Expected vs actual behavior
- Any error messages

## Feature Requests

Feature requests are welcome! Please:
- Check if the feature already exists
- Explain the use case
- Consider the single-file, no-build philosophy

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
