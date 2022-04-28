import { createElement } from "./Element.js"

export const show = (params) => {
  let container = document.getElementById('alert-container')
  
  let alert = createElement('calcite-alert', {
    color: params.color,
    icon: params.icon,
    active: true, 
    "auto-dissmiss": true
  }, 
  [
    createElement('div', {slot: 'title'}, params.title),
    createElement('div', {slot: 'message'}, params.message)
  ])
  container.appendChild(alert)
} 

export const remove = (containerId) => {
  let container = document.getElementById(containerId)
  container.innerHTML = ''
}