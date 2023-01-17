// Global Selection and Variables
const colorDivs = document.querySelectorAll('.color');
const generateBtn = document.querySelectorAll('.generate');
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll('.color h2');
const allSliders = document.querySelectorAll('.sliders input');
const popup = document.querySelector('.copy-container');
const adjustButton = document.querySelectorAll('.adjust');
const closeAdjustments = document.querySelectorAll('.close-adjustment');
const sliderContainers = document.querySelectorAll('.sliders');

// Event Listeners
sliders.forEach((slider) => {
    slider.addEventListener('input', hslControls);
});

colorDivs.forEach((div, index) => {
    div.addEventListener('change', () => {
        updateTextUI(index);
    });
});

currentHexes.forEach((hex) => {
    hex.addEventListener('click', () => {
        copyToClipboard(hex);
    });
});

adjustButton.forEach((button, index) => {
    button.addEventListener('click', () => {
        openAdjustmentPanel(index);
    });
});

closeAdjustments.forEach((button, index) => {
    button.addEventListener('click', () => {
        closeAdjustmentPanel(index);
    });
});

/**
 * Use Timeout instead of transitioned
 * @see copyToClipboard()
 */
// popup.addEventListener('transitionend', () => {
//     const popupBox = popup.children[0];
//     popup.classList.remove('active');
//     popupBox.classList.remove('active');
// })

// Functions
// Color Generator 
const generateHex = () => {
    const hexColor = chroma.random();
    return hexColor;
}

const checkTextContrast = (color, text) => {
    const luminance = chroma(color).luminance();
    if (luminance > 0.5)
        text.style.color = 'black';
    else
        text.style.color = 'white';
}


/**
 * Create a textarea, append it and then select it to then copy to clipboard
 * After copying remove the textarea 
 * @deprecated Creating text area with execCommand() is deprecated. Solution: navigator
 * @link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Interact_with_the_clipboard
 * 
 * Use navigator to copy 
 * Activate its antimation and setTimeout to remove animation 
 * @param {hex} h2 
 */
const copyToClipboard = (hex) => {
    // const el = document.createElement('textarea');
    // el.value = hex.innerText;
    // document.body.appendChild(el);
    // el.select();

    // document.execCommand('copy');
    // document.body.removeChild(el);

    navigator.clipboard.writeText(hex.innerText);

    // Pop up animation 
    const popupBox = popup.children[0];
    popup.classList.add('active'); // copy-container
    popupBox.classList.add('active'); // children
    setTimeout(() => {
        popup.classList.remove('active');
        popupBox.classList.remove('active');
    }, 1000);
}


/**'
 * Update the sliders accordingly to chosen color with hue, brightness, && saturation
 * Use chroma to set() according color spectrum background 
 * Hue has its own rainbow spectrum
 * 
 * Then, reset the input colors accordingly to its color and hsl
 * 
 */
const colorizeSliders = (color, hue, brightness, saturation) => {
    // Scale saturation 
    const noSat = color.set('hsl.s', 0);
    const fullSat = color.set('hsl.s', 1);
    const scaleSat = chroma.scale([noSat, color, fullSat]);

    // Scale brightness
    const midBright = color.set('hsl.l', 0.5);
    const scaleBright = chroma.scale(['black', midBright, 'white']);

    // Update input colors 
    saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSat(0)}, ${scaleSat(1)})`;
    brightness.style.backgroundImage = `linear-gradient(to right, ${scaleBright(0)}, ${scaleBright(0.5)}, ${scaleBright(1)})`;
    hue.style.backgroundImage = `
    linear-gradient(
        to right, 
        rgb(204, 75, 75),
        rgb(204, 204, 75),
        rgb(75, 204, 75),
        rgb(75, 204, 204),
        rgb(75, 75, 204),
        rgb(204, 75, 204),
        rgb(204, 75, 75)
        )`;

    // Reset input colors (h:1 s:1 l:2)
    saturation.value = color.hsl()[1];
    brightness.value = color.hsl()[2];
    hue.value = color.hsl()[0];
}

function randomColor() {
    // Initialize Colors to maintain original reference
    initialColors = [];

    // div return an HTMLCollection of all children in color
    colorDivs.forEach((div, index) => {
        const hexText = div.children[0];
        const randomColor = generateHex();

        // Add color to Array
        initialColors.push(chroma(randomColor).hex());

        // Add the random color to the background
        div.style.backgroundColor = randomColor;
        hexText.innerText = randomColor;

        // Check for contrast 
        checkTextContrast(randomColor, hexText);

        // Initialize colorize sliders 
        const color = chroma(randomColor);
        const sliders = div.querySelectorAll('.sliders input'); // 5: NodeList(3) [input.hue-input, input.bright-input, input.sat-input]
        const hue = sliders[0];
        const brightness = sliders[1];
        const saturation = sliders[2];

        colorizeSliders(color, hue, brightness, saturation);
    });
}

function hslControls(e) {
    // index holds the index of the corresponding slider control 
    const index =
        e.target.getAttribute('data-bright') ||
        e.target.getAttribute('data-sat') ||
        e.target.getAttribute('data-hue');

    // e.target.parentElement => <div class="sliders flex"></div>
    let sliders = e.target.parentElement.querySelectorAll('input[type="range"]');
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];


    const bgColor = initialColors[index];

    // get the color and set the corresponding values then add it to the background 
    let color = chroma(bgColor)
        .set('hsl.s', saturation.value)
        .set('hsl.l', brightness.value)
        .set('hsl.h', hue.value);


    colorDivs[index].style.backgroundColor = color;

    // update the sliders when modifying them
    colorizeSliders(color, hue, brightness, saturation);
}

/**
 * Use its index to click on its corresponding element
 * Then update the background color through the use of its background color
 * Convert the background color (RGB) to Hex color through chroma object
 * Set the text to the Hex color
 * 
 * Ensure to check the contrast for text/icons
 * 
 * @param {index} Nodelist Index (5)
 */
function updateTextUI(index) {
    const activeDiv = colorDivs[index];
    const color = chroma(activeDiv.style.backgroundColor);
    const textHex = activeDiv.querySelector('h2');
    const icons = activeDiv.querySelectorAll('.controls button');
    textHex.innerText = color.hex();
    // Check contrast
    checkTextContrast(color, textHex);
    for (icon of icons) checkTextContrast(color, icon);
}



function openAdjustmentPanel(index) {
    sliderContainers[index].classList.toggle('active');
}

function closeAdjustmentPanel(index) {
    sliderContainers[index].classList.remove('active');
}




randomColor();
