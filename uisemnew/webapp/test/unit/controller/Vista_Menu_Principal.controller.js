/*global QUnit*/

sap.ui.define([
	"nsnew/uisemnew/controller/Vista_Menu_Principal.controller"
], function (Controller) {
	"use strict";

	QUnit.module("Vista_Menu_Principal Controller");

	QUnit.test("I should test the Vista_Menu_Principal controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
