const power = document.getElementById('power');
const opacity = document.getElementById('opacity');
const opacityValue = document.getElementById('opacity-value');
const configs = document.getElementsByClassName('config-item');
const inputs = document.getElementsByTagName('input');

document.body.onload = document.body.classList.remove('preload');

chrome.storage.local.get(['power', 'opacity'], async (result) => {
    power.checked = result.power;
    for (let i = 0; i < configs.length; i++) {
        const config = configs.item(i).getElementsByTagName('input')[0];
        config.disabled = !result.power;
    }
    opacity.value = result.opacity;
    opacityValue.innerText = result.opacity;
});

power.addEventListener('click', async () => {
    await chrome.storage.local.set({ power: power.checked });
    for (let i = 0; i < configs.length; i++) {
        configs.item(i).getElementsByTagName('input')[0].disabled = !power.checked;
    }
});

opacity.addEventListener('input', async () => {
    opacityValue.innerText = opacity.value;
    await chrome.storage.local.set({ opacity: opacity.value });
});

