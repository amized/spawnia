



import DelayChain from "./DelayChain" 



function hasClass(el, className) {
  if (el.classList)
    return el.classList.contains(className)
  else
    return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'))
}

function addClass(el, className) {
  if (el.classList)
    el.classList.add(className)
  else if (!hasClass(el, className)) el.className += " " + className
}

function removeClass(el, className) {
  if (el.classList)
    el.classList.remove(className)
  else if (hasClass(el, className)) {
    var reg = new RegExp('(\\s|^)' + className + '(\\s|$)')
    el.className=el.className.replace(reg, ' ')
  }
}



const ADD_PREFIX = "add";
const REMOVE_PREFIX = "remove";
const SEPARATOR = "-";


var TransitionClass = {




	add: function (el, className, duration) {

		var dc = new DelayChain();

		var addClassName    = className + SEPARATOR + ADD_PREFIX;
		var removeClassName = className + SEPARATOR + REMOVE_PREFIX;

		/* Are we removing? */
		if (hasClass(el, removeClassName)) {
			removeClass(el, removeClassName);
		}

		/* Don't do anything if we are adding or already added */
		else if (hasClass(el, className) || hasClass(el, addClassName)) {
			return false;
		}


		dc.delay(1, ()=>{
			addClass(el, addClassName);
		}).delay(1, ()=>{
			addClass(el, className);
		}).delay(duration, ()=>{
			removeClass(el, addClassName)
		});

	},

	remove: function (el, className, duration)  {

		var dc = new DelayChain();

		var addClassName    = className + SEPARATOR + ADD_PREFIX;
		var removeClassName = className + SEPARATOR + REMOVE_PREFIX;


		/* Are we adding? */
		if (hasClass(el, addClassName)) {
			removeClass(el, addClassName);
		}

		/* Are we removing? */
		else if (!hasClass(el, className)) {
			/* Don't do anythign if the class isn't already there */
			return false;
		}

		dc.delay(1, ()=>{
			addClass(el, removeClassName);
		}).delay(1, ()=>{
			removeClass(el, className);
		}).delay(duration, ()=>{
			removeClass(el, removeClassName)
		});

		el.TransitionClassDC = dc;
	},
}


export default TransitionClass