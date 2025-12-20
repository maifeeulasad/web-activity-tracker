# Privacy Policy — Web Activity Tracker

**Effective Date:** December 20, 2025

Web Activity Tracker ("we", "our", or "the Extension") helps users track time spent on websites and provides local analytics and site limits. This Privacy Policy explains what data the extension collects or stores, how it is used, and how you can manage or delete your data.

---

## 1. Summary

- The extension stores activity data locally in your browser (IndexedDB) to provide analytics and enforce site time limits.  
- **No data is sent to external servers or third parties by default.** Any export you perform is done locally and requires your explicit action.

---

## 2. Data Collected and Purpose

The extension collects only the information necessary to provide its features:

- **Visited site domain / URL metadata (hostnames, path segments as needed)** — used to attribute time to sites and build top-sites reports.
- **Timestamps and durations** — used to calculate session lengths and charts.
- **Session and tab metadata** — internal identifiers to join intervals and summarize activity.
- **Settings and site limits** — preferences and user-configured limits stored to enforce notifications and restrictions.

Purpose: provide local analytics, site breakdowns, time trends, session summaries, and to notify users when site limits are reached.

---

## 3. Storage and Retention

- Data is stored locally in your browser using IndexedDB and is retained until you clear it or uninstall the extension.  
- The extension includes pruning controls to remove old records (configurable by you) and a **Clear All Data** option in Settings to permanently delete stored data.

---

## 4. Permissions and Why We Request Them

The extension requests minimal permissions required for its functionality:

- **`tabs` / `activeTab` / `host_permissions` (`<all_urls>`)** — to detect the active tab and determine the site a user is viewing (used only locally).
- **`storage`** — to save settings and local analytics in the browser.
- **`alarms`** — to schedule background tasks such as periodic pruning or sampling.
- **`notifications`** — to alert you when site limits are reached.

These permissions are **only used locally** and are not used to transmit data off-device.

---

## 5. Third-party Services and Analytics

- We **do not** use third-party analytics, ad networks, or tracking SDKs.  
- The extension does not send usage or analytics data to any external service by default.

If you choose to export data (CSV/JSON), that file is stored on your device and you control whether and how to share it.

---

## 6. Data Sharing and Export

- The extension may provide an export feature to download your activity data locally (if available). Exports are initiated by the user and are saved to the user's device.  
- We do not share data with third parties unless you explicitly export and share it yourself.

---

## 7. Security

- We follow standard practices to minimize risk: data never leaves the browser, and we avoid collecting unnecessary identifiers.  
- However, the security of locally stored data depends on your device and browser security: protect your device and only install extensions from trusted sources.

---

## 8. Children’s Privacy

- Our extension is not designed for collecting information from children. Parents should supervise use on children’s devices.  

---

## 9. Changes to This Policy

We may update this Privacy Policy to reflect changes in the extension or legal requirements. The latest version and effective date will be posted in the repository and extension listing.

---

## 10. Contact

If you have questions, concerns, or requests regarding your data, please open an issue in the repository or contact the maintainer:

https://github.com/maifeeulasad/web-activity-tracker
