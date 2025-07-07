echo "🔥 Removing Netlify Lighthouse plugin manually..."

rm -rf .netlify/plugins/node_modules/@netlify/plugin-lighthouse
rm -rf node_modules/@netlify/plugin-lighthouse

echo "✅ Lighthouse plugin manually removed."
