
function logcssvars() {
    const style = getComputedStyle(document.body)
    console.log('--tafl-inner-border-h:', style.getPropertyValue('--tafl-inner-border-h'))
    console.log('--tafl-inner-border-w:', style.getPropertyValue('--tafl-inner-border-w'))
    console.log('--tafl-inner-height:', style.getPropertyValue('--tafl-inner-height'))
    console.log('--tafl-inner-width:', style.getPropertyValue('--tafl-inner-width'))
    console.log('--tafl-border:', style.getPropertyValue('--tafl-border'))
    console.log('--tafl-height:', style.getPropertyValue('--tafl-height'))
    console.log('--tafl-width:', style.getPropertyValue('--tafl-width'))
}

function shallow_copy(arr) {
    let copy = Array(arr.length)
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].constructor === Array) {
            copy[i] = shallow_copy(arr[i])
        } else {
            copy[i] = arr[i]
        }
    }
    return copy
}


