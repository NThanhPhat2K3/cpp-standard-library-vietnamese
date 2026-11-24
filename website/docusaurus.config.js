module.exports = {
  title: 'C++ Standard Library', tagline: 'Đọc sâu C++, theo cách của bạn.',
  url: 'https://nthanhphat2k3.github.io', baseUrl: '/cpp-standard-library-vietnamese/',
  organizationName: 'NThanhPhat2K3', projectName: 'cpp-standard-library-vietnamese',
  onBrokenLinks: 'throw',
  i18n: {defaultLocale: 'vi', locales: ['vi']},
  presets: [['classic', {docs: {sidebarPath: require.resolve('./sidebars.js')}, blog: false, theme: {customCss: require.resolve('./src/css/custom.css')}}]],
  themeConfig: {navbar: {title: 'C++ / THƯ VIỆN CHUẨN', items: [{to: '/docs/chuong-01', label: 'Bắt đầu đọc', position: 'right'}]}, footer: {style: 'dark', copyright: 'Bản đọc tiếng Việt · Dựa trên sách của Nicolai M. Josuttis'}, colorMode: {defaultMode: 'light', respectPrefersColorScheme: true}}
};
