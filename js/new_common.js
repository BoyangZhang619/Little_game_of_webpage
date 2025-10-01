
function changeColor(type = "light", rgba = undefined) {
    if(rgba && /^\s*(25[0-5]|2[0-4]\d|1?\d{1,2})\s*,\s*(25[0-5]|2[0-4]\d|1?\d{1,2})\s*,\s*(25[0-5]|2[0-4]\d|1?\d{1,2})\s*,\s*(0(\.\d+)?|1(\.0+)?)\s*$/.test(rgba)){
        document.body.style.backgroundColor = `rgba(${rgba})`;
        return 0
    }
    document.body.style.backgroundColor = `rgba(${rgba})`;
}