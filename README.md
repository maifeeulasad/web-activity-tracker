# Web Activity Tracker

> A powerful Chrome extension to track time spent on websites with detailed analytics and customizable site limits.

![Version](https://img.shields.io/badge/version-0.1.2-blue.svg)
![License](https://img.shields.io/badge/license-AGPL--3.0-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue.svg)
![React](https://img.shields.io/badge/React-18.3.1-61dafb.svg)

## 📋 Overview

Web Activity Tracker is a privacy-focused Chrome extension that helps you understand and manage your web browsing habits. Track time spent on different websites, view detailed analytics, set site limits with notifications, and gain insights into your productivity patterns—all while keeping your data completely local and private.

## ✨ Features

### 📊 Comprehensive Dashboard
- **Real-time tracking** of active tab time
- **Daily statistics** with comparison to previous days
- **Top visited sites** with productivity scoring
- **Visual charts** showing time distribution across websites

### ⏱️ Time Tracker
- Track all browsing sessions with precise timing
- View session history with start/end times
- Filter and search through your browsing data
- Session-based analytics for detailed insights

### 📈 Analytics & Insights
- Beautiful visualizations of browsing patterns
- Daily, weekly, and custom date range views
- Productivity scoring for different website categories
- Trend analysis to understand usage patterns over time

### 🚫 Site Limits
- Set time limits for specific websites
- Receive notifications when approaching or exceeding limits
- Daily reset of limits
- Customizable warning thresholds

### ⚙️ Settings & Privacy
- **Dark mode** support for comfortable viewing
- Data retention controls with automatic pruning
- **Complete privacy**: all data stored locally in your browser
- Export your data to CSV/JSON for backup or analysis
- Clear all data option for fresh start

## 🖼️ Screenshots

*Dashboard view with analytics and top sites*
![Dashboard](docs/screenshot-dashboard.png)

*Time tracking interface*
![Time Tracker](docs/screenshot-tracker.png)

*Site limits configuration*
![Site Limits](docs/screenshot-limits.png)

## 🚀 Installation

### From Chrome Web Store
*(Coming soon)*

### Manual Installation (Developer Mode)

1. **Clone the repository**
   ```bash
   git clone https://github.com/maifeeulasad/web-activity-tracker.git
   cd web-activity-tracker
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Build the extension**
   ```bash
   pnpm run build
   # or
   npm run build
   ```

4. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist` folder from the project directory

5. **Start using!**
   - Click the extension icon in your Chrome toolbar
   - The extension will start tracking your browsing activity

## 💻 Development

### Prerequisites
- Node.js (v16 or higher)
- pnpm (recommended) or npm
- Chrome browser

### Setup Development Environment

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Start development server**
   ```bash
   pnpm run dev
   ```

3. **Build for production**
   ```bash
   pnpm run build
   ```

4. **Lint code**
   ```bash
   pnpm run lint
   # or auto-fix issues
   pnpm run lint:fix
   ```

### Available Scripts

- `pnpm run dev` - Start Vite development server
- `pnpm run build` - Build extension for production (includes TypeScript compilation and packaging)
- `pnpm run package` - Create distributable ZIP file
- `pnpm run lint` - Run ESLint for code quality
- `pnpm run lint:fix` - Auto-fix linting issues
- `pnpm run preview` - Preview production build

### Project Structure

```
web-activity-tracker/
├── src/
│   ├── components/        # React components
│   ├── pages/            # Main page components
│   │   ├── Dashboard.tsx
│   │   ├── TimeTracker.tsx
│   │   ├── Analytics.tsx
│   │   ├── SiteLimits.tsx
│   │   └── Settings.tsx
│   ├── hooks/            # Custom React hooks
│   ├── storage/          # IndexedDB storage management
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions and helpers
│   ├── background.ts     # Chrome extension background service worker
│   ├── App.tsx           # Main application component
│   └── main.tsx          # Application entry point
├── public/
│   ├── manifest.json     # Chrome extension manifest
│   └── icons/            # Extension icons
├── index.html            # Extension popup HTML
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Project dependencies
```

## 🛠️ Tech Stack

- **Framework**: React 18.3.1 with TypeScript
- **UI Library**: Ant Design 6.0.0 (antd)
- **Charts**: Ant Design Charts (@antv/g2plot)
- **Storage**: IndexedDB (via idb-ts)
- **Build Tool**: Vite 5.2.0
- **Code Quality**: ESLint with TypeScript support
- **Date Handling**: date-fns 4.1.0

## 🔒 Privacy

Web Activity Tracker is built with privacy as a top priority:

- ✅ **100% local storage** - All data stays in your browser
- ✅ **No external servers** - No data is sent anywhere
- ✅ **No analytics** - We don't track your usage
- ✅ **No ads** - Clean, distraction-free interface
- ✅ **Open source** - Verify the code yourself

For detailed privacy information, see [privacy.md](privacy.md).

## 📦 Building & Packaging

To create a distributable ZIP file:

```bash
pnpm run build
```

This will:
1. Compile TypeScript files
2. Build React application with Vite
3. Copy manifest and assets to `dist/`
4. Create `web-activity-tracker.zip` in the root directory

The ZIP file can be uploaded to the Chrome Web Store or distributed directly.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the GNU Affero General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2025 Maifee Ul Asad

## 👤 Author

**Maifee Ul Asad**
- Email: maifeeulasad@gmail.com
- GitHub: [@maifeeulasad](https://github.com/maifeeulasad)

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/)
- UI components from [Ant Design](https://ant.design/)
- Charts powered by [AntV G2Plot](https://g2plot.antv.vision/)
- Icons from [Ant Design Icons](https://ant.design/components/icon/)

## 📊 Roadmap

- [ ] Firefox extension support
- [ ] Enhanced productivity insights with AI
- [ ] Category-based time tracking
- [ ] Weekly/monthly reports via email
- [ ] Focus mode with website blocking
- [ ] Integration with productivity tools
- [ ] Mobile companion app

## ❓ FAQ

**Q: Does this extension collect my browsing data?**  
A: No. All data is stored locally in your browser using IndexedDB. Nothing is sent to external servers.

**Q: Will this slow down my browser?**  
A: No. The extension is lightweight and uses minimal resources. It only tracks active tab changes.

**Q: Can I export my data?**  
A: Yes, you can export your data to CSV or JSON format from the Settings page.

**Q: How do I delete all my data?**  
A: Go to Settings and use the "Clear All Data" option.

**Q: Does it work in incognito mode?**  
A: By default, Chrome extensions don't run in incognito. You can enable it in Chrome's extension settings if desired.

## 🐛 Bug Reports & Feature Requests

If you encounter any bugs or have feature requests, please [open an issue](https://github.com/maifeeulasad/web-activity-tracker/issues) on GitHub.

---

Made with ❤️ by Maifee Ul Asad