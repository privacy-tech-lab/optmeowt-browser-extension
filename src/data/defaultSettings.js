/*
OptMeowt is licensed under the MIT License
Copyright (c) 2020 Kuba Alicki, Daniel Knopf, Abdallah Salia, Sebastian Zimmeck
privacy-tech-lab, https://privacytechlab.org/
*/

/*
settings.js
================================================================================
settings.js exports the default global extension settings
NOTE: 
*/


import { extensionMode } from "../background/storage.js"


// We could also make the keys here the values of an enumerated object, but
// there is less incentive to do so since it complicates the code and 
// it will be easier to catch a mistake here than mistyping and `enable` string
export const defaultSettings = {
	'MODE': extensionMode.enabled,
	'TUTORIAL_SHOWN': false,
	'BROWSER': '$BROWSER'
}