import subprocess

edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
temp_profile = r"C:\Users\sathi\.gemini\antigravity\brain\7d4661fe-5e71-4173-8776-8f41a009a4e0\scratch\edge_profile"

# Run node or edge to inspect page scrollWidth
script = """
const docWidth = document.documentElement.scrollWidth;
const bodyWidth = document.body.scrollWidth;
const wideElements = [];
document.querySelectorAll('*').forEach(el => {
  if (el.offsetWidth > 360) {
    wideElements.push({
      tag: el.tagName,
      id: el.id,
      className: el.className ? el.className.substring(0, 50) : '',
      width: el.offsetWidth
    });
  }
});
console.log(JSON.stringify({ docWidth, bodyWidth, wideCount: wideElements.length, topWide: wideElements.slice(0, 10) }));
"""

with open(r"c:\Users\sathi\Desktop\Wooden decoring\scratch_check_width.js", "w", encoding="utf-8") as f:
    f.write(script)

print("Created script to check overflowing elements.")
