import subprocess
import json

# Let's inspect element widths with python executing a small script in edge or analyzing CSS
# In Edge, we can print document.querySelector('header').outerHTML or compute sizes
script = """
const header = document.querySelector('header > div');
const logo = document.querySelector('header a');
const actions = document.querySelector('header .flex-shrink-0:last-child');
const buttons = Array.from(actions.children).map(b => ({
  tag: b.tagName,
  id: b.id,
  class: b.className,
  width: b.offsetWidth,
  display: window.getComputedStyle(b).display
}));
console.log(JSON.stringify({
  windowWidth: window.innerWidth,
  headerWidth: header.offsetWidth,
  logoWidth: logo.offsetWidth,
  actionsWidth: actions.offsetWidth,
  buttons: buttons
}));
"""
print("Analyzing...")
