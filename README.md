# StudyHub - Modern Learning Platform

StudyHub is a responsive, accessible, and feature-rich learning platform designed to enhance the educational journey of students. Built with modern web technologies and best practices in UI/UX design.

## Features

- **Responsive Design**: Seamlessly adapts to mobile, tablet, and desktop screens
- **Modern UI**: Clean, intuitive interface with smooth animations and transitions
- **Accessibility**: WCAG 2.1 AA compliant with full keyboard navigation support
- **Interactive Elements**: Dynamic navigation, mobile menu, and comment system
- **Local Storage**: Persistent comment storage without requiring a backend

## Technology Stack

- HTML5 for semantic markup
- Tailwind CSS for utility-first styling
- Vanilla JavaScript for interactivity
- Google Fonts (Inter) for typography

## Project Structure

```
study-web/
├── index.html      # Main HTML structure
├── styles.css      # Custom styles and Tailwind directives
├── script.js       # JavaScript functionality
└── README.md       # Project documentation
```

## Getting Started

1. Clone the repository
2. Open `index.html` in a modern web browser
3. No build tools or installation required

## Customization

### Colors

The color scheme can be customized in `styles.css`:

```css
:root {
    --primary-color: #1D4ED8;
    --secondary-color: #10B981;
    --neutral-color: #F3F4F6;
}
```

### Typography

The site uses the Inter font family with various weights (400, 500, 600, 700). To modify:

1. Update the Google Fonts link in `index.html`
2. Adjust the font-family in `styles.css`

### Features

Each feature card in the home section can be customized in `index.html`. Add new features by following the existing card structure and applying the `feature-card` class.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Deployment

The site can be deployed to any static hosting service:

### Netlify

1. Connect your repository
2. Set build command to `none`
3. Set publish directory to root

### Vercel

1. Import your repository
2. No configuration needed
3. Deploy

## Performance Optimization

- Minify CSS and JavaScript files before deployment
- Optimize images if added to the project
- Use browser caching through proper headers
- Implement lazy loading for below-the-fold content

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## Best Practices

- Follow semantic HTML structure
- Maintain accessibility standards
- Keep JavaScript modular and documented
- Use consistent code formatting
- Test across different devices and browsers

## License

MIT License - feel free to use this project for personal or commercial purposes.