sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/MessageBox",
    "sap/ui/export/Spreadsheet",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/core/BusyIndicator",
    "sap/ui/core/format/DateFormat"

],
    function (Controller, Dialog, Button, MessageToast, MessageBox, Spreadsheet, Fragment, BusyIndicator, DateFormat) {
        "use strict";
        var ind_conecta_json_sap = "1";
        var v_url_identity = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyDM4OMbwZmcYoMkwt1dSxwDCNZhMKeKcr8";
        var v_email = "jclira@rivercon.com";
        var v_pass = "Rivercon2024";
        //var ogDialog = "";
        //var v_url_ini = "https://rivercon.com/RcomExpensesAIQAS";
        var v_url_ini = "/cpblcase";

        return Controller.extend("nsnew.uisemnew.controller.Vista_Bandeja_Solicitud", {
            onInit: function () {
                var oModel = this.getView().getModel("myParam");
                console.log("Controller onInit");
                this.getRouter().getRoute("Vista_Bandeja_Solicitud").attachMatched(this.onRouteMatched, this);
                this.getView().addStyleClass("sapUiSizeCompact");
                var oDate = new Date();
                var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                    pattern: "yyyy-MM-dd" 
                });
                var sDate = oDateFormat.format(oDate);
                var oViewModel = new sap.ui.model.json.JSONModel({
                    fechaSolicitud: sDate
                });
                this.getView().setModel(oViewModel, "viewModel");
            },
            onRouteMatched: async function () {
                console.log("onRouteMatched ");
                var that = this
                var oModel = this.getView().getModel("myParam");
                oModel.setProperty("/solicitud_selected_cab", []);
                oModel.setProperty("/lista_liquidacion_cab", []);
                oModel.setProperty("/lista_ord_cab", []);
                BusyIndicator.show(0);
                setTimeout(function () {
                    that.f_get_lista_solicitud();
                    BusyIndicator.hide();
                }, 1000);  // 1000 milisegundos = 1 segundo
                if (!oModel) {
                    console.error("El modelo 'myParam' no está disponible. Verifica la asignación del modelo en Component.js.");
                    return;
                }
                if (oModel.getProperty("/T_TIP_COMP")) {
                    var aTipCompData = oModel.getProperty("/T_TIP_COMP");
                    var bHasSeleccionar = aTipCompData.some(function (item) {
                        return item.TIP_COMP === "";
                    });

                    if (!bHasSeleccionar) {
                        var oNewTipCompItem = { TIP_COMP: "", DESC_COMP: "Seleccionar" };
                        aTipCompData.unshift(oNewTipCompItem);
                        oModel.setProperty("/T_TIP_COMP", aTipCompData);
                    }
                }
                if (oModel.getProperty("/T_OBJ_CO")) {
                    var aObjCoData = oModel.getProperty("/T_OBJ_CO");

                    var bHasSeleccionarObjCo = aObjCoData.some(function (item) {
                        return item.OBJ_CO === ""; // Verifica que no se duplique
                    });

                    if (!bHasSeleccionarObjCo) {
                        var oNewObjCoItem = { OBJ_CO: "", DESC_OBJ_CO: "Seleccionar" };
                        aObjCoData.unshift(oNewObjCoItem);
                        oModel.setProperty("/T_OBJ_CO", aObjCoData);
                    }
                }

                oModel.refresh(true);

                //console.log("Datos T_TIP_COMP:", oModel.getProperty("/T_TIP_COMP"));
                //console.log("Datos T_OBJ_CO:", oModel.getProperty("/T_OBJ_CO"));
            },
            onBeforeRendering: function () {
                console.log("onbeforerendering");
                var oModel = this.getView().getModel("myParam");
                var v_nombre_usuario = "";

                $.ajax({
                    type: "GET",
                    async: false,
                    //url: "/cpblcase/getDM.php", 
                    url: "/cpblcase/getUser.php",
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'ContentType': 'application/json',
                        'X-CSRF-Token': 'Fetch'
                    },
                    success: function (result, textStatus, response) {
                        //console.log('result'); console.log(result);
                        //console.log('textStatus'); console.log(textStatus);
                        //console.log('response'); console.log(response);
                        //console.log('result onBeforeRendering'); console.log(result);
                        var v_token = response.getResponseHeader('X-CSRF-Token');
                        //console.log('v_token', v_token);
                        oModel.setProperty("/token", v_token);
                        oModel.setProperty("/usuario", response);
                        oModel.setProperty("/v_nombre_usuario", response);
                    }.bind(this),
                    error: function (error) {
                        console.log(error);
                        console.log("Seteando mandante por defecto");
                        oModel.setProperty("/token", "E");
                        oModel.setProperty("/usuario", "E");
                        oModel.setProperty("/v_nombre_usuario", "E");
                    }.bind(this),
                });

                /*
                $.ajax({
                    type: "GET",
                    async: false,
                    url: "/cpblcasetoken/mydb/obtUser",
                    headers: {
                        ContentType: 'application/json', 
                        Accept: 'application/json',
                        cache: false, 
                        'X-CSRF-Token': 'Fetch'
                    },
                    success: function (result, textStatus, request) {
                        console.log('result onBeforeRendering'); console.log(result);
                        var v_token = request.getResponseHeader('X-CSRF-Token');
                        console.log('v_token', v_token);
                        oModel.setProperty("/token", v_token);
                        oModel.setProperty("/usuario", result.value[0].Resp);
    
                        v_nombre_usuario =  oModel.getProperty("/T_NOMBRE_USUARIO").filter(function(user) { return user.id == oModel.getProperty("/usuario"); })[0];
                        if (v_nombre_usuario) { oModel.setProperty("/nombre_usuario", v_nombre_usuario.descripcion); } 
                        else { oModel.setProperty("/nombre_usuario", oModel.getProperty("/usuario")); }
    
                    }.bind(this),
                    error: function (error) {
                        console.log(error);
                        console.log("Seteando mandante por defecto");
                        oModel.setProperty("/token","E");    
                        oModel.setProperty("/usuario", "E");  
                        
                        v_nombre_usuario =  oModel.getProperty("/T_NOMBRE_USUARIO").filter(function(user) { 
                            return user.id == oModel.getProperty("/usuario"); 
                        })[0];
                        if (v_nombre_usuario) { oModel.setProperty("/nombre_usuario", v_nombre_usuario.descripcion); } 
                        else { oModel.setProperty("/nombre_usuario", oModel.getProperty("/usuario")); }
    
                    }.bind(this),
                });
                */
            },
            onAfterRendering: async function () {
                console.log('afterrendering llama routematched');
                this.onRouteMatched();
            },
            f_press_volver: function () {
                this.getRouter().navTo("Vista_Menu_Principal");
            },
            f_press_ver_detalle: function (oEvent) {
                var oListItem = oEvent.getParameter("listItem");

                // Verifica que el item no sea undefined
                if (oListItem) {
                    // Obtener el contexto del item
                    var oContext = oListItem.getBindingContext("myParam");

                    if (oContext) {
                        // Obtener los datos del contexto
                        var v_cod_solititud_selected = oContext.getObject();
                        console.log(v_cod_solititud_selected);
                        //this.getView().getModel("myParam").setProperty("/solicitudSeleccionada", v_cod_solititud_selected);
                        this.getView().getModel("myParam").setProperty("/solicitud_selected_cab/0", v_cod_solititud_selected);

                        BusyIndicator.show(0);
                        this.f_get_det_sol_liq_ord();
                        BusyIndicator.hide();
                        //this.getRouter().navTo("Vista_Detalle_Solicitud");
                    } else {
                        console.log("No se pudo obtener el contexto.");
                    }
                } else {
                    console.log("oListItem es undefined.");
                }
            },
            f_get_det_sol_liq_ord: async function () {
                var dataRes = null;
                var oModel = this.getView().getModel("myParam");
                var v_url = "";

                var v_data_liq_cab;
                var v_data_ord_cab;
                var v_data_sol_cab;
                var v_data_adj_cab;

                try {
                    var v_sociedad = oModel.getProperty("/empresa_seleccionada");
                    //var v_solicitud_sel_obj = oModel.getProperty("/solicitudSeleccionada"); 
                    var v_solicitud_sel_obj = oModel.getProperty("/solicitud_selected_cab/0");

                    //validación del objeto de solicitud seleccionado--------
                    if (v_solicitud_sel_obj == undefined || v_solicitud_sel_obj.TIP_SOL == undefined) {
                        sap.m.MessageBox.information("Porfavor, valide la solicitud seleccionada");
                        return;
                    }
                    //-------------------------------------------------------
                    //actualiza visualizacion de tabfilter, solo antipo es para CCH y ERE------
                    if (v_solicitud_sel_obj.TIP_SOL == "CCH" || v_solicitud_sel_obj.TIP_SOL == "ERE" || v_solicitud_sel_obj.TIP_SOL == "CJC") {
                        this.byId("IconTabfilter_anticipo").setVisible(true);
                    }
                    else {
                        this.byId("IconTabfilter_anticipo").setVisible(false);
                    }
                    //-------------------------------------------------------------------------



                    v_url = v_url_ini + "/" + `getDetSol.php?USER=adlira&SOC=${v_sociedad}&SOL=${v_solicitud_sel_obj.ID_SOL}`;

                    if (ind_conecta_json_sap == "1") {
                        dataRes = await this.f_ajax('GET', v_url, '', oModel.getProperty("/token"));
                        if (dataRes != undefined) {
                            dataRes = JSON.parse(dataRes);
                            if (dataRes.T_LIQ != undefined && dataRes.T_ORD != undefined) {
                                v_data_liq_cab = dataRes.T_LIQ;
                                v_data_ord_cab = dataRes.T_ORD;
                                v_data_sol_cab = dataRes.T_SOL;
                                v_data_adj_cab = dataRes.T_ADJ;

                                //v_data_liq_cab = v_data_liq_cab.filter(item => 
                                //    ["C", "V", "L"].includes(item.EST_LIQ)
                                //);
                            }
                            else {
                                MessageToast.show("Error en el contenido de la respuesta del servidor, póngase en contacto con el proveedor");
                                return;
                            }
                        } else {
                            MessageToast.show("Error en la respuesta del servidor, póngase en contacto con el proveedor");
                            return;
                        }
                    }
                    else {

                        v_data_liq_cab = [
                            //  {"ID_LIQ":"2","ID_SOL":"2","DES_LIQ":"Liq 2","EST_LIQ":"X","FEC_LIQ":"2024-08-29","SOCIEDAD":"1000","USR_AP_N1":"JCLIRA","USR_AP_N2":"ADLIRA","EST_LIB":"XX","USR_CREA":"adlira","FEC_CREA":"2024-08-2907:13:43"},
                            //   {"ID_LIQ":"3","ID_SOL":"2","DES_LIQ":"Liq 3","EST_LIQ":"C","FEC_LIQ":"2024-08-29","SOCIEDAD":"1000","USR_AP_N1":"JCLIRA","USR_AP_N2":"ADLIRA","EST_LIB":"XX","USR_CREA":"adlira","FEC_CREA":"2024-08-2907:13:43"},
                            // {"ID_LIQ":"4","ID_SOL":"2","DES_LIQ":"Liq 4","EST_LIQ":"V","FEC_LIQ":"2024-08-29","SOCIEDAD":"1000","USR_AP_N1":"JCLIRA","USR_AP_N2":"ADLIRA","EST_LIB":"XX","USR_CREA":"adlira","FEC_CREA":"2024-08-2907:13:43"},
                            // {"ID_LIQ":"5","ID_SOL":"2","DES_LIQ":"Liq 5","EST_LIQ":"L","FEC_LIQ":"2024-08-29","SOCIEDAD":"1000","USR_AP_N1":"JCLIRA","USR_AP_N2":"ADLIRA","EST_LIB":"XX","USR_CREA":"adlira","FEC_CREA":"2024-08-2907:13:43"},
                            //{"ID_LIQ":"6","ID_SOL":"2","DES_LIQ":"Liq 6","EST_LIQ":"L","FEC_LIQ":"2024-08-29","SOCIEDAD":"1000","USR_AP_N1":"JCLIRA","USR_AP_N2":"ADLIRA","EST_LIB":"XX","USR_CREA":"adlira","FEC_CREA":"2024-08-2907:13:43"}, 
                        ];
                        v_data_liq_cab = v_data_liq_cab.filter(item =>
                            ["C", "V", "L"].includes(item.EST_LIQ)
                        );
                        v_data_ord_cab = [{ "ID_ORD": "29", "ID_SOL": "2", "DES_ORD": "sol", "EST_ORD": "P", "FEC_ORD": "2024-09-24", "IMP_ORD": "111.00", "MON_ORD": "PEN", "SOCIEDAD": "1000", "USR_AP_N1": "JCLIRA", "USR_AP_N2": "ADLIRA", "EST_LIB": "XX", "ERP_OBJTYPE": null, "ERP_OBJKEY": null, "USR_CREA": "jclira", "FEC_CREA": "2024-10-05 17:52:13", "USR_MOD": null, "FEC_MOD": null }];
                        v_data_sol_cab = [{ "ID_SOL": "2", "TIP_SOL": "CCH", "FEC_SOL": "2024-08-29", "EST_SOL": "B", "MOT_SOL": "Solicitud 02", "SOCIEDAD": "1000", "USR_CREA": "adlira", "FEC_CREA": "2024-08-29 05:30:44", "USR_MOD": null, "FEC_MOD": null, "USR_SOL": "jclira" }];
                        v_data_adj_cab = [{ "ID_ADJ": "181", "ID_SOL": "2", "ID_LIQ": "2", "POS_LIQ": "1", "DESC_ADJ": "", "RUTA_ADJ": "", "B64": "\/9j\/4AAQSkZJRgABAQEAYABgAAD\/2wBDAAMCAgMCARRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAH\/\/Z" }];
                        //v_data_adj_cab = [{"ID_ADJ":"181","ID_SOL":"2","ID_LIQ":"2","POS_LIQ":"1","DESC_ADJ":"","RUTA_ADJ":"","B64":"data:image\/jpeg;base64,\/9j\/4AAQSkZJRgABAQEAYABgAAD\/2wBDAAMCAgMCARRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAH\/\/Z"}]
                    }

                    if (dataRes != undefined && dataRes[0] != undefined && dataRes[0].type != undefined && dataRes[0].type == "E") {
                        if (dataRes[0].MESSAGE == undefined) { MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor"); }
                        else { MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor (" + dataRes[0].MESSAGE + ")"); }
                        return;
                    } else {
                        oModel.setProperty("/lista_liquidacion_cab", v_data_liq_cab);
                        oModel.setProperty("/lista_ord_cab", v_data_ord_cab);
                        oModel.setProperty("/solicitud_selected_cab", v_data_sol_cab);
                        oModel.setProperty("/lista_adj_cab", v_data_adj_cab);

                        this.f_refresca_montos_calculados();
                    }


                } catch (error) {
                    if (error == undefined) {
                        MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor");
                    }
                    else {
                        if (error.descripcion != undefined) { MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor (" + error.descripcion + ")"); }
                        else if (error.message != undefined) { MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor (" + error.message + ")"); }
                        else { MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor"); }
                    }
                    return;
                }
            },
            f_change_tipo_solicitud: function () {
                var v_tipo_solicitud = sap.ui.core.Fragment.byId('NuevaSolicitudDialog', "cmb_tipo_solicitud").getSelectedKey();
                //console.log("v_tipo_solicitud");
                //console.log(v_tipo_solicitud);
                if (v_tipo_solicitud == "ERE" || v_tipo_solicitud == "REE") {
                    sap.ui.core.Fragment.byId('NuevaSolicitudDialog', "txt_sol_field1").setProperty("editable", true);
                }
                else {
                    sap.ui.core.Fragment.byId('NuevaSolicitudDialog', "txt_sol_field1").setValue("");
                    sap.ui.core.Fragment.byId('NuevaSolicitudDialog', "txt_sol_field1").setProperty("editable", false);
                }
            },
            onPrint: function () {
                //this.getView().setBusy(true); 
                //var desIGV = ''; 
                var oModelMyParam = this.getView().getModel("myParam");
                oModelMyParam.setProperty("/liquidacionCab", []);
                var Amodel = this.getView().getModel("myParam");
                // var indiceIGV = Amodel.getProperty("/indiceIGV");
                //var num_solicitud = oModelMyParam.getProperty("/solicitudSeleccionada/NRO_SOL");
                //var num_solicitud2 = oModelMyParam.getProperty("/solicitudSeleccionada");
                //var objeto = oModelMyParam.getProperty("/objetoSeleccionada");
                var item = this.getView().byId("table_liquidacion").getSelectedItem();
                var objeto = item.getBindingContext("myParam").getObject();
                var num_solicitud2 = oModelMyParam.getProperty("/solicitud_selected_cab/0");
                //console.log("objeto", objeto)
                //console.log("num_solicitud2", num_solicitud2);
                if (num_solicitud2.TIP_SOL == "ERE" || num_solicitud2.TIP_SOL == "CCH" || num_solicitud2.TIP_SOL == "REE") {
                    if (objeto.EST_LIQ == "P" || objeto.EST_LIQ == "X" || objeto.EST_LIQ == "L") {
                        var filters = [];
                        var filter;
                        filter = new sap.ui.model.Filter("ID_SOL", sap.ui.model.FilterOperator.EQ, objeto.ID_SOL);
                        filters.push(filter);

                        var anticipos = oModelMyParam.getProperty("/lista_ord_cab");

                        if (anticipos.length !== 0) {
                            var anticipo = anticipos[0];
                            var resultadoAnt = anticipos;
                            //console.log("resultadoAnt", resultadoAnt)
                        } else {
                            this.MessageBoxPress('information', "La solicitud " + objeto.ID_SOL + " relacionanda a la liquidación " + objeto.ID_LIQ + " no presenta ningún anticipo.")
                        }


                        var oThis = this;
                        var oModel9 = oThis.getView().getModel("myParam");
                        //this.oGlobalStop10 = "S";
                        //this.oGlobalIteracion0 = "0";
                        oModel9.setProperty("/oListaVectorCabeceraDetalle", []);
                        //this.oEntrar = "N";

                        this.f_get_detalle_liquidacion(objeto.ID_LIQ, true)
                        var oVectorCabeceraDetalle = oModel9.getProperty("/detalleLiquidacion");
                        //console.log("oVectorCabeceraDetalle", oVectorCabeceraDetalle)

                        var o = $.sap.getModulePath("Entregas_Rendir_vs6.Entregas_Rendir_vs6", "/css/");
                        var d = o + "style2.css";
                        var c = '<html>';
                        c += "<head>";
                        c += '<link rel="stylesheet" href="' + d + '" type="text/css" />';
                        c += "</head>";
                        c += "<body>";
                        if (num_solicitud2.TIP_SOL == "REE") {
                            c += '<p style="text-align: center;"><strong>REPORTE REEMBOLSO N&deg; ' + num_solicitud2.ID_SOL + '</strong></p>';
                        } else if (num_solicitud2.TIP_SOL == "ERE") {
                            c += '<p style="text-align: center;"><strong>REPORTE ENTREGAS A RENDIR N&deg; ' + num_solicitud2.ID_SOL +
                                '</strong></p>';
                        } else if (num_solicitud2.TIP_SOL == "CCH") {
                            c += '<p style="text-align: center;"><strong>REPORTE CAJA CHICA N&deg; ' + num_solicitud2.ID_SOL + '</strong></p>';
                        }
                        c += '<table style="width: 99.8081%;  border-collapse: collapse;">';
                        c += '<tbody>';
                        c += '<tr>';
                        c += '<td style="width: 7.69231%;border: 1px solid black;border: 1px solid black;" bgcolor="#ccd3da">';
                        c += '<p><strong>Solicitante:</strong></p>';
                        c += '</td>';
                        c += '<td style="width: 7.69231%;border: 1px solid black;">';
                        c += '<p>' + num_solicitud2.USR_SOL + '</p>';
                        c += '</td>';
                        //c += '<td style="width: 7.69231%;border: 1px solid black;" bgcolor="#ccd3da">';
                        //c += '<p><strong>Área:</strong></p>';
                        //c += '</td>';
                        //c += '<td style="width: 7.69231%;border: 1px solid black;">';
                        //c += '<p>' + num_solicitud2.WERKS + '</p>';
                        //c += '</td>';
                        if (num_solicitud2.TIP_SOL == "REE" || num_solicitud2.TIP_SOL == "ERE") {
                            c += '<td style="width: 7.69231%;border: 1px solid black;" bgcolor="#ccd3da">';
                            c += '<p><strong>N° Solicitud:</strong></p>';
                            c += '</td>';
                            c += '<td style="width: 7.69231%;border: 1px solid black;">';
                            c += '<p>' + num_solicitud2.ID_SOL + '</p>';
                            c += '</td>';
                            c += '<td style="width: 7.78846%;border: 1px solid black;" bgcolor="#ccd3da">';
                            c += '<p><strong>N° Anticipo:</strong></p>';
                            c += '</td>';
                            c += '<td style="width: 7.78846%;border: 1px solid black;">';
                            c += '<p>' + anticipo.ID_ORD + '</p>';
                            c += '</td>';
                        } else {
                            c += '<td style="width: 7.69231%;border: 1px solid black;" bgcolor="#ccd3da">';
                            c += '<p><strong>N° Solicitud:</strong></p>';
                            c += '</td>';
                            c += '<td style="width: 23.0769%;border: 1px solid black;" colspan="3">';
                            c += '<p>' + num_solicitud2.ID_SOL + '</p>';
                            c += '</td>';
                        }
                        c += '<td style="width: 7.78846%;border: 1px solid black;" bgcolor="#ccd3da">';
                        c += '<p><strong>N° Liquidación:</strong></p>';
                        c += '</td>';
                        c += '<td style="width: 7.78846%;border: 1px solid black;">';
                        c += '<p>' + objeto.ID_LIQ + '</p>';
                        c += '</td>';
                        c += '<td style="width: 7.78846%;border: 1px solid black;" bgcolor="#ccd3da">';
                        c += '<p><strong>Estado</strong></p>';
                        c += '</td>';
                        c += '<td style="width: 7.78846%;border: 1px solid black;">';
                        c += '<p>' + this.f_format_est_sol(objeto.EST_LIQ) + '</p>';
                        c += '</td>';
                        c += '</tr>';
                        c += '<tr>';

                        if (num_solicitud2.TIP_SOL == "REE" || num_solicitud2.TIP_SOL == "ERE") {
                            c += '<td style="width: 7.69231%;border: 1px solid black;" bgcolor="#ccd3da">';
                            c += '<p><strong>Comentario:</strong></p>';
                            c += '</td>';
                            c += '<td style="width: 23.0769%;border: 1px solid black;" colspan="3">';
                            c += '<p>' + objeto.DES_LIQ + '</p>';
                            c += '</td>';
                        } else {
                            c += '<td style="width: 7.69231%;border: 1px solid black;" bgcolor="#ccd3da">';
                            c += '<p><strong>Caja Chica:</strong></p>';
                            c += '</td>';
                            c += '<td style="width: 7.69231%;border: 1px solid black;">';
                            c += '<p>' + objeto.DES_LIQ + '</p>';
                            c += '</td>';
                            c += '<td style="width: 7.69231%;border: 1px solid black;" bgcolor="#ccd3da">';
                            c += '<p><strong>Comentario:</strong></p>';
                            c += '</td>';
                            c += '<td style="width: 7.69231%;border: 1px solid black;">';
                            c += '<p>' + objeto.DES_LIQ + '</p>';
                            c += '</td>';
                        }
                        if (num_solicitud2.TIP_SOL == "REE" || num_solicitud2.TIP_SOL == "ERE") {
                            c += '<td style="width: 7.69231%;border: 1px solid black;" bgcolor="#ccd3da">';
                            c += '<p><strong>Fecha Solicitud:</strong></p>';
                            c += '</td>';
                            c += '<td style="width: 7.69231%;border: 1px solid black;">';
                            //c += '<p>' + this.fecSolicitudFormato(num_solicitud2.FEC_SOL) + '</p>';
                            c += '<p>' + num_solicitud2.FEC_SOL + '</p>';

                            c += '</td>';
                            c += '<td style="width: 7.78846%;border: 1px solid black;" bgcolor="#ccd3da">';
                            c += '<p><strong>Fecha Anticipo:</strong></p>';
                            c += '</td>';
                            c += '<td style="width: 7.78846%;border: 1px solid black;">';
                            //c += '<p>' + this.fecSolicitudFormato(anticipo.FEC_SAR) + '</p>';
                            c += '<p>' + anticipo.FEC_ORD + '</p>';
                            c += '</td>';
                        } else {
                            c += '<td style="width: 7.69231%;border: 1px solid black;" bgcolor="#ccd3da">';
                            c += '<p><strong>Fecha Solicitud:</strong></p>';
                            c += '</td>';
                            c += '<td style="width: 23.0769%;border: 1px solid black;" colspan="3">';
                            //c += '<p>' + this.fecSolicitudFormato(num_solicitud2.FEC_SOL) + '</p>';
                            c += '<p>' + num_solicitud2.FEC_SOL + '</p>';
                            c += '</td>';
                        }
                        c += '<td style="width: 7.78846%;border: 1px solid black;" bgcolor="#ccd3da">';
                        c += '<p><strong>Fecha Liquidación:</strong></p>';
                        c += '</td>';
                        c += '<td style="width: 23.3654%;border: 1px solid black;" colspan="3">';
                        //c += '<p>' + this.fecSolicitudFormato(objeto.FEC_LIQ) + '</p>';
                        c += '<p>' + objeto.FEC_LIQ + '</p>';
                        c += '</td>';
                        c += '</tr>';
                        c += '</tbody>';
                        c += '</table>';
                        c += '<p></p>';
                        if (num_solicitud2.TIP_SOL == "CCH") {
                            c += '<table style="width: 100%; border-collapse: collapse;">'
                            c += '<tbody>';
                            c += '<tr>';
                            c +=
                                '<td style="width: 100%; height: 13px; text-align: center; border: 1px solid black;" bgcolor="#ccd3da" colspan="9"><strong>Anticipos</strong></td>';
                            c += '</tr>';
                            c += '<tr>';
                            c += '<td style="border: 1px solid black;">Nro.Ant.</td>';
                            c += '<td style="border: 1px solid black;">Descripción</td>';
                            c += '<td style="border: 1px solid black;">Importe</td>';
                            c += '<td style="border: 1px solid black;">Moneda</td>';
                            c += '<td style="border: 1px solid black;">Estado Liberacion</td>';
                            c += '<td style="border: 1px solid black;">Fecha Anticipo</td>';
                            c += '<td style="border: 1px solid black;">Sociedad</td>';
                            //c += '<td style="border: 1px solid black;">Ejercicio</td>';
                            c += '<td style="border: 1px solid black;">Estado</td>';
                            c += '</tr>';
                            resultadoAnt.sort(function compare(a, b) {
                                if (a.FEC_ORD < b.FEC_ORD) {
                                    return -1;
                                }
                                if (a.FEC_ORD > b.FEC_ORD) {
                                    return 1;
                                }
                                return 0;
                            });
                            for (var t = 0; t < resultadoAnt.length; t++) {
                                c += '<tr>';
                                c += '<td style="border: 1px solid black;">' + resultadoAnt[t].ID_ORD + '</td>';
                                c += '<td style="border: 1px solid black;">' + resultadoAnt[t].DES_ORD + '</td>';
                                c += '<td style="border: 1px solid black;">' + resultadoAnt[t].IMP_ORD + '</td>';
                                c += '<td style="border: 1px solid black;">' + resultadoAnt[t].MON_ORD + '</td>';
                                c += '<td style="border: 1px solid black;">' + resultadoAnt[t].EST_LIB + '</td>';
                                //c += '<td style="border: 1px solid black;">' + this.fecSolicitudFormato(resultadoAnt[t].FEC_SAR) + '</td>';
                                c += '<td style="border: 1px solid black;">' + resultadoAnt[t].FEC_ORD + '</td>';
                                c += '<td style="border: 1px solid black;">' + resultadoAnt[t].SOCIEDAD + '</td>';
                                //c += '<td style="border: 1px solid black;">' + resultadoAnt[t].GJAHR + '</td>';
                                c += '<td style="border: 1px solid black;">' + resultadoAnt[t].EST_ORD + '</td>';
                                c += '</tr>';
                            }
                            c += '</tbody>';
                            c += '</table>';
                        }

                        c += '<p style="text-align: center;"><strong>TABLA DETALLE DE LA LIQUIDACIÓN N&deg; ' + objeto.ID_LIQ +
                            '</strong></p>';
                        c += '<table style="width: 100%; border-collapse: collapse;">';
                        c += '<tbody>';
                        c += '<tr style="height: 13px;">';
                        c +=
                            '<td style="width: 100%; height: 13px; text-align: center; border: 1px solid black;" bgcolor="#ccd3da"><strong>Liquidaci&oacute;n de Gastos</strong></td>';
                        c += '</tr>';
                        c += '</tbody>';
                        c += '</table>';
                        c += '<table style="width: 100%; border-collapse: collapse;">';
                        c += '<tbody>';
                        c += '<tr>';
                        c += '<td style="width: 7.14%; border: 1px solid black;">N&deg;</td>';
                        c += '<td style="width: 7.14%; border: 1px solid black;">&nbsp;Fecha Gasto</td>';
                        c += '<td style="width: 7.14%; border: 1px solid black;">RUC</td>';
                        c += '<td style="width: 7.14%; border: 1px solid black;">&nbsp;Raz&oacute;n Social</td>';
                        c += '<td style="width: 7.14%; border: 1px solid black;">Descripci&oacute;n</td>';
                        c += '<td style="width: 7.14%; border: 1px solid black;">&nbsp;Concepto de pago</td>';
                        c += '<td style="width: 7.14%; border: 1px solid black;">Tipo de comprobante</td>';
                        c += '<td style="width: 7.14%; border: 1px solid black;">&nbsp;# Comprobante</td>';
                        c += '<td style="width: 7.14%; border: 1px solid black;">Ind. Impuesto</td>';
                        c += '<td style="width: 14.28%; border: 1px solid black;">&nbsp;Impuesto</td>';
                        c += '<td style="width: 7.14%; border: 1px solid black;">&nbsp;Importe</td>';
                        //c += '<td style="width: 7.14%; border: 1px solid black;">&nbsp;Devoluci&oacute;n</td>';
                        c += '<td style="width: 7.14%; border: 1px solid black;">&nbsp;Moneda</td>';
                        c += '</tr>';
                        /*
                        oVectorCabeceraDetalle.sort(function compare(a, b) {
                            if (parseInt(a.POS_LIQ.toString()) < parseInt(b.POS_LIQ.toString())) {
                                return -1;
                            }
                            if (parseInt(a.POS_LIQ.toString()) > parseInt(b.POS_LIQ.toString())) {
                                return 1;
                            }
                            return 0;
                        }); */
                        var monedaG = "";
                        var totalDet = 0;
                        for (var j = 0; j < oVectorCabeceraDetalle.length; j++) {
                            if (oVectorCabeceraDetalle[j].ID_LIQ == objeto.ID_LIQ && oVectorCabeceraDetalle[j].EST_LIQ !== "R") {
                                c += '<tr>';
                                c += '<td style="width: 7.14%; border: 1px solid black;">' + oVectorCabeceraDetalle[j].POS_LIQ + '</td>';
                                //c += '<td style="width: 7.14%; border: 1px solid black;">' + this.fecSolicitudFormato(oVectorCabeceraDetalle[j].FEC_GTO) + '</td>';
                                c += '<td style="width: 7.14%; border: 1px solid black;">' + oVectorCabeceraDetalle[j].FEC_GTO + '</td>';
                                c += '<td style="width: 7.14%; border: 1px solid black;">' + oVectorCabeceraDetalle[j].NIF_PROV + '</td>';
                                c += '<td style="width: 7.14%; border: 1px solid black;">' + oVectorCabeceraDetalle[j].RAZ_PROV + '</td>';
                                c += '<td style="width: 7.14%; border: 1px solid black;">' + oVectorCabeceraDetalle[j].DESC_GTO + '</td>';
                                c += '<td style="width: 7.14%; border: 1px solid black;">' + oVectorCabeceraDetalle[j].ID_CONCEPTO + '</td>';
                                c += '<td style="width: 7.14%; border: 1px solid black;">' + oVectorCabeceraDetalle[j].TIP_COMP + '</td>';
                                //c += '<td style="width: 7.14%; border: 1px solid black;">' + this.tipComprFormato(oVectorCabeceraDetalle[j].TIP_COMP) + '</td>'; 
                                c += '<td style="width: 7.14%; border: 1px solid black;">' + oVectorCabeceraDetalle[j].NRO_COMP + '</td>';
                                /*
                                for (var s = 0; s < indiceIGV.length; s++) {
                                    if (oVectorCabeceraDetalle[j].IND_IGV_GTO == indiceIGV[s].id) {
                                        desIGV = indiceIGV[s].des;
                                    }
                                }*/

                                //c += '<td style="width: 7.14%; border: 1px solid black;">' + oVectorCabeceraDetalle[j].IND_IGV_GTO + '</td>';
                                c += '<td style="width: 7.14%; border: 1px solid black;">' + oVectorCabeceraDetalle[j].IND_IGV_GTO + '</td>';
                                //c += '<td style="width: 14.28%; border: 1px solid black;">' + desIGV + '</td>';
                                //c += '<td style="width: 7.14%; border: 1px solid black;"></td>';
                                c += '<td style="width: 7.14%; border: 1px solid black;">' + oVectorCabeceraDetalle[j].IMP_GTO + '</td>';
                                c += '<td style="width: 7.14%; border: 1px solid black;">' + oVectorCabeceraDetalle[j].IMP_GTO_S + '</td>';
                                c += '<td style="width: 7.14%; border: 1px solid black;">' + oVectorCabeceraDetalle[j].MON_GTO + '</td>';
                                c += '</tr>';
                                totalDet += parseFloat(oVectorCabeceraDetalle[j].IMP_GTO_S);
                                monedaG = oVectorCabeceraDetalle[j].MON_GTO;
                            }
                        }
                        c += '<tr>';
                        c += '<td style="width: 7.14%; border: 1px solid black;"></td>';
                        c += '<td style="width: 7.14%; border: 1px solid black;"></td>';
                        c += '<td style="width: 7.14%; border: 1px solid black;"></td>';
                        c += '<td style="width: 7.14%; border: 1px solid black;"></td>';
                        c += '<td style="width: 7.14%; border: 1px solid black;"></td>';
                        c += '<td style="width: 7.14%; border: 1px solid black;"></td>';
                        c += '<td style="width: 7.14%; border: 1px solid black;"></td>';
                        c += '<td style="width: 7.14%; border: 1px solid black;"></td>';
                        c += '<td style="width: 7.14%; border: 1px solid black;"></td>';
                        c += '<td style="width: 14.28%; border: 1px solid black;">TOTAL</td>';
                        c += '<td style="width: 7.14%; border: 1px solid black;">' + totalDet.toFixed(2) + '</td>';
                        c += '<td style="width: 7.14%; border: 1px solid black;">' + monedaG + '</td>';
                        c += '</tr>';

                        c += '</tbody>';
                        c += '</table>';
                        c += "</body>";
                        c += "</html>";
                        var params = 'width=' + screen.width;
                        params += ', height=' + screen.height;
                        params += ', top=0, left=0';
                        params += ', fullscreen=yes';
                        var u = window.open("", "", params);
                        u.document.open();
                        u.document.write(c);
                        u.document.close();
                        u.focus();
                        u.print();
                        // u.close();
                        this.getView().setBusy(false);

                        this.getView().setBusy(false);

                    } else {

                        this.MessageBoxPress('information', "La liquidación " + objeto.ID_LIQ + " requiere ser liberada o liquidada para poder ser impresa.")
                    }
                } else {
                    this.MessageBoxPress('information', "La impresión solo está habilitada para Entregas a Rendir, Reembolso y Caja Chica.")

                }

            },
            f_get_lista_solicitud: async function (EST) {
                var dataRes = null;
                var oModel = this.getView().getModel("myParam");
                var v_url = "";
                EST = EST || "A,C,G"

                try {
                    var v_sociedad = oModel.getProperty("/empresa_seleccionada");
                    var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "yyyy-MM-dd" });
                    var v_fecha_referencia_fin = new Date();
                    v_fecha_referencia_fin.setFullYear(v_fecha_referencia_fin.getFullYear() + 1);
                    var v_fecha_formateada_ini = "2023-08-10";
                    var v_fecha_formateada_fin = oDateFormat.format(v_fecha_referencia_fin);

                    v_url = v_url_ini + `/getSol.php?SOC=${v_sociedad}&FecD=${v_fecha_formateada_ini}&FecH=${v_fecha_formateada_fin}&EST=${EST}`;

                    if (ind_conecta_json_sap === "1") {
                        dataRes = await this.f_ajax('GET', v_url, '', oModel.getProperty("/token"));
                        dataRes = JSON.parse(dataRes)
                        if (dataRes.T_SOL != undefined) {
                            dataRes = dataRes.T_SOL;
                            oModel.setProperty("/lista_bandeja_solicitud", dataRes);
                        } else {
                            MessageToast.show("Error en la respuesta del servidor, póngase en contacto con el proveedor");
                            return;
                        }
                    } else {
                        dataRes = [{ "USR_SOL": "0007000407", "ID_SOL": "2", "NRO_SOL": "104231", "TIP_SOL": "CCH", "FEC_SOL": "03/09/2024", "EST_SOL": "C", "MOT_SOL": "PRUEBA 1 TICKET 2024-0287", "SOCIEDAD": "SOCIEDAD", "TEXT_SOL": "TEXTO" }];
                    }

                    if (dataRes != undefined && dataRes[0] != undefined && dataRes[0].type != undefined && dataRes[0].type == "E") {
                        if (dataRes[0].MESSAGE == undefined) { MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor"); }
                        else { MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor (" + dataRes[0].MESSAGE + ")"); }
                        return;
                    } else {
                        oModel.setProperty("/lista_bandeja_solicitud", dataRes);
                        //MessageToast.show(`solicitud obtenida correctamente`);  
                        return;
                    }
                } catch (error) {
                    if (error == undefined) {
                        MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor");
                    }
                    else {
                        if (error.descripcion != undefined) { MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor (" + error.descripcion + ")"); }
                        else if (error.message != undefined) { MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor (" + error.message + ")"); }
                        else { MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor"); }
                    }
                    return;
                }
            },
            f_get_fecha_actual: function () {
                /*var currentDate = new Date();
                var day = currentDate.getDate().toLocaleString("es-PE", { timeZone: "America/Lima" });
                var month = currentDate.getMonth().toLocaleString("es-PE", { timeZone: "America/Lima" }) + 1;
                day = day.toString();
                month = month.toString();
                if (day.length == 1) { day = "0" + day; }
                if (month.length == 1) {  month = "0" + month;  } */
                //return currentDate.getFullYear()+'-'+ month+'-'+day; 
                var options = { timeZone: "America/Lima", year: "numeric", month: "2-digit", day: "2-digit" };
                var formattedDate = new Intl.DateTimeFormat("es-PE", options).format(new Date());
                formattedDate = formattedDate.split("/").reverse().join("-");
                return formattedDate;
            },
            f_reg_nueva_solicitud: async function () {
                var dataRes = null;
                var oModel = this.getView().getModel("myParam");
                var v_url = "";
                var btnNuevaSolicitud = sap.ui.core.Fragment.byId('NuevaSolicitudDialog', "btnNuevaSolicitud");
                btnNuevaSolicitud.setEnabled(false)
                try {
                    var v_sociedad = oModel.getProperty("/empresa_seleccionada");
                    var v_tip_sol = sap.ui.core.Fragment.byId('NuevaSolicitudDialog', "cmb_tipo_solicitud").getSelectedKey();
                    var v_fec_sol = sap.ui.core.Fragment.byId('NuevaSolicitudDialog', "txt_fecha_solicitud").getValue();
                    var v_mot_sol = sap.ui.core.Fragment.byId('NuevaSolicitudDialog', "txt_motivo").getValue();


                    //analiza campos customizados----
                    var v_sol_field_1 = sap.ui.core.Fragment.byId('NuevaSolicitudDialog', "txt_sol_field1").getValue();
                    //-------------------------------

                    v_url = v_url_ini + "/getSol.php";

                    if (ind_conecta_json_sap == "1") {
                        let data = {
                            METHOD: "C",
                            TIP_SOL: v_tip_sol,
                            FEC_SOL: v_fec_sol,
                            EST_SOL: "C",
                            MOT_SOL: v_mot_sol,
                            SOCIEDAD: v_sociedad,
                            //Campos customizados
                            FIELD1: v_sol_field_1,
                        };

                        //console.log('data');
                        //console.log(data);

                        dataRes = await this.f_ajax('POST', v_url, data, oModel.getProperty("/token"));
                    }
                    else {
                        dataRes = 'New record created successfully';
                    }

                    if (dataRes != undefined && dataRes[0] != undefined && dataRes[0].type != undefined && dataRes[0].type == "E") {
                        if (dataRes[0].MESSAGE == undefined) { MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor"); }
                        else { MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor (" + dataRes[0].MESSAGE + ")"); }
                        return;
                    } else {
                        //if(dataRes == 'New record created successfully') { 
                        btnNuevaSolicitud.setEnabled(true);
                        sap.m.MessageBox.information("Solicitud generada correctamente");
                        this.f_get_lista_solicitud()
                        //} else { 
                        //    MessageToast.show("Error en la respuesta del servidor, póngase en contacto con el proveedor"); 
                        //    return;
                        //}  
                    }

                } catch (error) {
                    btnNuevaSolicitud.setEnabled(true)

                    if (error == undefined) {
                        MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor");
                    }
                    else {
                        if (error.descripcion != undefined) { MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor (" + error.descripcion + ")"); }
                        else if (error.message != undefined) { MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor (" + error.message + ")"); }
                        else { MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor"); }
                    }
                    return;
                }
            },
            f_filtrar_solicitud: function (oEvent) {
                var arr_filter = [];
                var v_texto = oEvent.getSource().getValue();
                if (v_texto && v_texto.length > 0) {
                    var v_filter = new sap.ui.model.Filter("ID_SOL", sap.ui.model.FilterOperator.Contains, v_texto);
                    arr_filter.push(v_filter);
                    this.byId("list_tabla_solicitud").getBinding("items").filter(arr_filter);
                } else {
                    this.byId("list_tabla_solicitud").getBinding("items").filter([]);
                }
            },
            f_agregar_solicitud_fragment: function () {
                this.f_dialog_show("NuevaSolicitudDialog", "NuevaSolicitud", "Nueva Solicitud", 'guardar solicitud');
            },
            f_editar_solicitud_fragment: function () {
                this.f_dialog_show("NuevaSolicitudDialog", "NuevaSolicitud", "Editar", 'editar');
            },
            f_format_tipo_solicitud: function (p_tipo) {
                var oModel = this.getView().getModel("myParam");
                var v_tabla = oModel.getProperty("/T_TIPO_SOLICITUD");

                if (p_tipo != null && p_tipo != undefined && p_tipo != "" && v_tabla != undefined && v_tabla != "") {
                    var v_obj_buscado = v_tabla.find(function (item) { return item.id == p_tipo; });
                    if (v_obj_buscado) { return v_obj_buscado.descripcion; }
                    else { return p_tipo; }
                } else {
                    return p_tipo;
                }
            },
            f_format_est_sol: function (p_tipo) {
                var oModel = this.getView().getModel("myParam");
                var v_tabla = oModel.getProperty("/T_EST_SOL");

                if (p_tipo != null && p_tipo != undefined && p_tipo != "" && v_tabla != undefined && v_tabla != "") {
                    var v_obj_buscado = v_tabla.find(function (item) { return item.id == p_tipo; });
                    if (v_obj_buscado) { return v_obj_buscado.descripcion; }
                    else { return p_tipo; }
                } else {
                    return p_tipo;
                }
            },
            f_format_est_ord: function (p_tipo) {
                var oModel = this.getView().getModel("myParam");
                var v_tabla = oModel.getProperty("/T_EST_ORD");

                if (p_tipo != null && p_tipo != undefined && p_tipo != "" && v_tabla != undefined && v_tabla != "") {
                    var v_obj_buscado = v_tabla.find(function (item) { return item.id == p_tipo; });
                    if (v_obj_buscado) { return v_obj_buscado.descripcion; }
                    else { return p_tipo; }
                } else {
                    return p_tipo;
                }
            },
            f_format_est_liq: function (p_tipo) {
                var oModel = this.getView().getModel("myParam");
                var v_tabla = oModel.getProperty("/T_EST_LIQ");

                if (p_tipo != null && p_tipo != undefined && p_tipo != "" && v_tabla != undefined && v_tabla != "") {
                    var v_obj_buscado = v_tabla.find(function (item) { return item.id == p_tipo; });
                    if (v_obj_buscado) { return v_obj_buscado.descripcion; }
                    else { return p_tipo; }
                } else {
                    return p_tipo;
                }
            },
            f_format_est_gto: function (p_tipo) {
                var oModel = this.getView().getModel("myParam");
                var v_tabla = oModel.getProperty("/T_EST_GTO");

                if (p_tipo != null && p_tipo != undefined && p_tipo != "" && v_tabla != undefined && v_tabla != "") {
                    var v_obj_buscado = v_tabla.find(function (item) { return item.id == p_tipo; });
                    if (v_obj_buscado) { return v_obj_buscado.descripcion; }
                    else { return p_tipo; }
                } else {
                    return p_tipo;
                }
            },
            f_format_t_concepto: function (p_tipo) {
                var oModel = this.getView().getModel("myParam");
                var v_tabla = oModel.getProperty("/T_CONCEPTO");

                if (p_tipo != null && p_tipo != undefined && p_tipo != "" && v_tabla != undefined && v_tabla != "") {
                    var v_obj_buscado = v_tabla.find(function (item) { return item.ID_CONCEPTO == p_tipo; });
                    if (v_obj_buscado) { return v_obj_buscado.DES_CONCEPTO; }
                    else { return p_tipo; }
                } else {
                    return p_tipo;
                }
            },
            f_format_t_tip_comp: function (p_tipo) {
                var oModel = this.getView().getModel("myParam");
                var v_tabla = oModel.getProperty("/T_TIP_COMP");

                if (p_tipo != null && p_tipo != undefined && p_tipo != "" && v_tabla != undefined && v_tabla != "") {
                    var v_obj_buscado = v_tabla.find(function (item) { return item.TIP_COMP == p_tipo; });
                    if (v_obj_buscado) { return v_obj_buscado.DESC_COMP; }
                    else { return p_tipo; }
                } else {
                    return p_tipo;
                }
            },
            f_format_t_nombre_usuario: function (p_tipo) {
                var oModel = this.getView().getModel("myParam");
                var v_tabla = oModel.getProperty("/T_NOMBRE_USUARIO");

                if (p_tipo != null && p_tipo != undefined && p_tipo != "" && v_tabla != undefined && v_tabla != "") {
                    var v_obj_buscado = v_tabla.find(function (item) { return item.id == p_tipo; });
                    if (v_obj_buscado) { return v_obj_buscado.descripcion; }
                    else { return p_tipo; }
                } else {
                    return p_tipo;
                }
            },
            f_format_x_fecha: function () {
                var oModel = this.getView().getModel("myParam");
                var feg_gto = oModel.getProperty("/FEC_GTO");

                if (feg_gto !== null && feg_gto !== undefined && feg_gto !== "") {
                    let partes = fecha.split('-');

                    // Reorganizar para obtener el formato "dd/mm/yyyy"
                    let fechaConvertida = `${partes[2]}/${partes[1]}/${partes[0]}`;
                    return fechaConvertida;
                } else {
                    return feg_gto;
                }
            },
            f_format_h_fecha: function (fecha) {
                if (fecha !== null && fecha !== undefined && fecha !== "") {
                    let partes = fecha.split('/');
                    // Reorganizar para obtener el formato "yyyy-mm-dd"
                    let fechaConvertida = `${partes[2]}-${partes[1]}-${partes[0]}`;
                    return fechaConvertida;
                } else {
                    return fecha;
                }
            },
            f_tipo_imagen_solicitud: function (TIP_SOL) {
                var p_image_tipo = "../img/caja.png";
                switch (TIP_SOL) {
                    case "ERE":
                        p_image_tipo = "../img/mano_corona.png"
                        break;
                    case "REE":
                        p_image_tipo = "../img/mano_dinero.jpg"
                        break;
                    case "CCH":
                        p_image_tipo = "../img/caja.jpg"
                        break;
                    default:
                        p_image_tipo = "sap-icon://sap-box"
                        break;
                }
                return p_image_tipo;
            },
            f_guardar: function (idDialog, namespace, type) {
                switch (type) {
                    case 'editar':
                        break;
                    case 'crear':
                        //valida datos de crear solicitud
                        var v_tip_sol = sap.ui.core.Fragment.byId('NuevaSolicitudDialog', "cmb_tipo_solicitud").getSelectedKey();
                        var v_fec_sol = sap.ui.core.Fragment.byId('NuevaSolicitudDialog', "txt_fecha_solicitud").getValue();
                        var v_mot_sol = sap.ui.core.Fragment.byId('NuevaSolicitudDialog', "txt_motivo").getValue();

                        var btnNuevaSolicitud = sap.ui.core.Fragment.byId('NuevaSolicitudDialog', "btnNuevaSolicitud");
                        btnNuevaSolicitud.setEnabled(false)

                        if (v_tip_sol == undefined || v_tip_sol == "") {
                            sap.m.MessageBox.information("Por favor, ingrese un tipo de solicitud");
                            btnNuevaSolicitud.setEnabled(true);
                            return;
                        }
                        else if (v_fec_sol == undefined || v_fec_sol == "") {
                            sap.m.MessageBox.information("Por favor, valide la fecha de solicitud");
                            btnNuevaSolicitud.setEnabled(true);
                            return;
                        }
                        else if (v_mot_sol == undefined || v_mot_sol == "") {
                            sap.m.MessageBox.information("Por favor, ingrese el motivo de solicitud");
                            btnNuevaSolicitud.setEnabled(true);
                            return;
                        }


                        //console.log("v_fec_sol", v_fec_sol)
                        var oInputDate = new Date(v_fec_sol.split("-")[0], v_fec_sol.split("-")[1] - 1, v_fec_sol.split("-")[2]); // Convertir a objeto Date
                        var oCurrentDate = new Date();
                        oCurrentDate.setHours(0, 0, 0, 0);
                        //console.log('oInputDate', oInputDate); 
                        //console.log('oCurrentDate', oCurrentDate);
                        if (!(oInputDate.getTime() === oCurrentDate.getTime())) {
                            sap.m.MessageBox.information("Por favor, la fecha ingresada no es igual a la del día de hoy");
                            btnNuevaSolicitud.setEnabled(true);
                            return;
                        }

                        //valida campos customizados--------------
                        if (sap.ui.core.Fragment.byId('NuevaSolicitudDialog', "tool_txt_sol_field1").getProperty("visible") == true) {
                            //si el campo está habilitado en la sociedad, configura validación
                            if (v_tip_sol == "ERE" || v_tip_sol == "REE") {
                                var v_sol_field_1 = sap.ui.core.Fragment.byId('NuevaSolicitudDialog', "txt_sol_field1").getValue();
                                /* if(v_sol_field_1 == undefined || v_sol_field_1 == ""){
                                    sap.m.MessageBox.information("Por favor, valide el campo obligatorio");
                                    return;
                                }*/
                            }
                        }
                        //------------------------------------------

                        this.f_reg_nueva_solicitud();
                        break;
                    case 'guardar_detalle_liquidacion':

                        let tipo_operacion = this.ogDialog.getTitle();


                        //valida guardar detalle liquidación
                        var oModel = this.getView().getModel("myParam");
                        var v_items_detalle_liquidacion = oModel.getProperty("/detalleLiquidacion");
                        //console.log('v_items_detalle_liquidacion', v_items_detalle_liquidacion);
                        if (v_items_detalle_liquidacion.length == 0) {
                            sap.m.MessageBox.information("Por favor, valide el detalle de liquidación, se encuentra vacío");
                            return;
                        }
                        this.f_reg_nueva_liquidacion();
                        break;
                    default:
                        break;
                }
                this.ogDialog.destroy();
            },
            f_eliminar_solicitud: async function () {
                var dataRes;
                var oModel = this.getView().getModel("myParam");
                var oData = oModel.getProperty("/solicitud_selected_cab");

                if (oData.length != 1) {
                    sap.m.MessageBox.information("No puede realizar la acción, seleccionar antes una solicitud");
                    return;
                }



                var lista_cab_ordenes = oModel.getProperty("/lista_ord_cab");
                var ind_esta_activo = false;
                if (lista_cab_ordenes != undefined && lista_cab_ordenes.length > 0) {
                    for (var i = 0; i < lista_cab_ordenes.length; i++) {
                        //if(lista_cab_ordenes[i].EST_ORD === "L" || lista_cab_ordenes[i].EST_ORD === "P") {
                        if (oData[0].EST_SOL !== "C") {
                            if (lista_cab_ordenes[i].EST_ORD !== "R" && lista_cab_ordenes[i].EST_ORD !== "B") {
                                ind_esta_activo = true;
                            }
                        }
                    }
                }
                if (ind_esta_activo) {
                    //sap.m.MessageBox.information("No se puede eliminar una solicitud, con anticipo liberado.");
                    sap.m.MessageBox.information("No se puede borrar porque tiene anticipos activos.");
                    return;
                }

                let ok = await this.MessageBoxPress('information', "Está seguro que quieres eliminar la solicitud?")
                if (ok) {
                    try {
                        const url = v_url_ini + "/getSol.php";
                        var data = { METHOD: "D", "ID_SOL": oData[0].ID_SOL }
                        var that = this;
                        if (ind_conecta_json_sap === "1") {
                            dataRes = await this.f_ajax('POST', url, data, oModel.getProperty("/token"));
                        } else {
                            dataRes = "Record deleted successfully";
                        }
                        if (dataRes != undefined && dataRes[0] != undefined && dataRes[0].type != undefined && dataRes[0].type == "E") {
                            if (dataRes[0].MESSAGE == undefined) { MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor"); }
                            else { MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor (" + dataRes[0].MESSAGE + ")"); }
                            return;
                        } else {
                            //if(dataRes == "Record deleted successfully") { 
                            sap.m.MessageBox.information("Solicitud borrada correctamente");
                            that.f_get_lista_solicitud();
                            //} else { 
                            //    MessageToast.show("Error en la respuesta del servidor, póngase en contacto con el proveedor"); 
                            //    return;
                            //}  
                        }
                    } catch (error) {
                        if (error == undefined) {
                            MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor");
                        }
                        else {
                            if (error.descripcion != undefined) { MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor (" + error.descripcion + ")"); }
                            else if (error.message != undefined) { MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor (" + error.message + ")"); }
                            else { MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor"); }
                        }
                        return;
                    }
                }
            },
            f_eliminar_detalle_liquidacion: function (oEvent) {

                // Obtener el contexto del elemento de la tabla que fue clickeado
                var oItem = oEvent.getSource().getParent();  // El botón es hijo del FlexBox, subimos un nivel al ColumnListItem
                var oBindingContext = oItem.getBindingContext("myParam");  // Obtiene el contexto vinculado al modelo 'myParam'

                // Obtener el índice de la fila seleccionada
                var iIndex = oBindingContext.getPath().split("/").pop();  // Esto obtiene el índice de la fila en el array

                // Obtener los datos actuales del modelo
                var oModel = this.getView().getModel("myParam");
                var aData = oModel.getProperty("/detalleLiquidacion");
                oModel.setProperty("/iIndex", iIndex);
                // Eliminar el elemento del array aData en el índice iIndex
                aData.splice(iIndex, 1);

                // Actualizar el modelo con los nuevos datos
                oModel.setProperty("/detalleLiquidacion", aData);

                // Refrescar el modelo para actualizar la vista (opcional)
                this.f_get_static_detalle_liquidacion()
                oModel.refresh(true);
            },
            f_editar_detalle_liquidacion: function (oEvent) {
                // Obtener el contexto del elemento de la tabla que fue clickeado
                var oItem = oEvent.getSource().getParent();  // El botón es hijo del FlexBox, subimos un nivel al ColumnListItem
                var oBindingContext = oItem.getBindingContext("myParam");  // Obtiene el contexto vinculado al modelo 'myParam'

                // Obtener el índice de la fila seleccionada
                var iIndex = oBindingContext.getPath().split("/").pop();  // Esto obtiene el índice de la fila en el array

                // Obtener los datos actuales del modelo
                var oModel = this.getView().getModel("myParam");
                var aData = oModel.getProperty("/detalleLiquidacion");
                console.log("aData", aData[iIndex]);

                //sap.ui.core.Fragment.byId('formNuevoLiquidacion',"txt_fecha_liquidacion").setValue(aData[iIndex].FEC_GTO);
                sap.ui.core.Fragment.byId('formNuevoLiquidacion', "cmb_concepto_gasto").setSelectedKey(aData[iIndex].ID_CONCEPTO);
                sap.ui.core.Fragment.byId('formNuevoLiquidacion', "txt_descripcion_gasto").setValue(aData[iIndex].DESC_GTO);
                sap.ui.core.Fragment.byId('formNuevoLiquidacion', "txt_fecha_gasto").setValue(aData[iIndex].FEC_GTO);
                sap.ui.core.Fragment.byId('formNuevoLiquidacion', "txt_ruc_nif_proveedor").setValue(aData[iIndex].NIF_PROV);
                sap.ui.core.Fragment.byId('formNuevoLiquidacion', "txt_razon_social").setValue(aData[iIndex].RAZ_PROV);
                sap.ui.core.Fragment.byId('formNuevoLiquidacion', "cmb_tipo_comprobante").setSelectedKey(aData[iIndex].TIP_COMP);
                sap.ui.core.Fragment.byId('formNuevoLiquidacion', "txt_nro_comprobante").setValue(aData[iIndex].NRO_COMP);
                sap.ui.core.Fragment.byId('formNuevoLiquidacion', "txt_monto_gasto").setValue(aData[iIndex].IMP_GTO);
                sap.ui.core.Fragment.byId('formNuevoLiquidacion', "cmb_moneda_gasto").setSelectedKey(aData[iIndex].MON_GTO);
                sap.ui.core.Fragment.byId('formNuevoLiquidacion', "cmb_iva").setSelectedKey(aData[iIndex].IND_IVA);
                sap.ui.core.Fragment.byId('formNuevoLiquidacion', "cmb_ceco").setSelectedKey(aData[iIndex].OBJ_CO);

            },
            f_cancelar: function (idDialog, namespace) {
                this.ogDialog.destroy();
            },
            onDialogShow: function (idDialog, namespace, title = 'Formulario') {
                var oView = this.getView();
                if (!this.ogDialog) {
                    this.ogDialog = sap.ui.xmlfragment(`${idDialog}`, `nsnew.uisemnew.view.fragments.${namespace}`, this)
                };
                oView.addDependent(this.ogDialog);
                this.ogDialog.setTitle(`${title} Solicitud`);
                return this.ogDialog;
            },
            f_dialog_show: function (p_idDialog, namespace, title = 'Formulario', type, oData) {
                var oView = this.getView();
                var oModel = oView.getModel("myParam");
                var lista_cab_liq = oModel.getProperty("/lista_liquidacion_cab");
                var lista_cab_ordenes = oModel.getProperty("/lista_ord_cab");

                var oBindingContext = this.getView().byId("objHeaderSolicitud").getBindingContext("myParam");
                var v_tip_sol = oBindingContext.getProperty("TIP_SOL");

                //console.log("p_idDialog", p_idDialog);
                //console.log("type", type);
                //console.log("oData", oData);
                //Validación si cumple las condiciones para ejecutarse (LOGICA DE VALIDACIÓN)
                if (p_idDialog == "formNuevoAnticipo" && type == "guardar") { //Acción: Registrar nuevo anticipo, 
                    console.log("GUARDAR");
                    if (v_tip_sol == "CCH" || v_tip_sol.TIP_SOL == "CJC") {
                        var ind_existe_estado_pendiente = false; //Valida su lista de anticipos, si alguno estuviera en proceso o pendiente de liberar, no puede registrar nuevo
                        var ind_falta_aprobacion_de_aprobadores = false; //Valida si falta aprobación por los aprobadores

                        if (lista_cab_ordenes != undefined && lista_cab_ordenes.length > 0) {
                            for (var i = 0; i < lista_cab_ordenes.length; i++) {
                                if (lista_cab_ordenes[i].EST_ORD != "R" && lista_cab_ordenes[i].EST_ORD != "B") {
                                    if (lista_cab_ordenes[i].EST_ORD != "P" && lista_cab_ordenes[i].EST_ORD != "L") {
                                        //se encuentra en proceso, aún no está liberado
                                        ind_existe_estado_pendiente = true;
                                        break;
                                    }
                                    else if (lista_cab_ordenes[i].EST_ORD == "P" || lista_cab_ordenes[i].EST_ORD == "L") {
                                        //se encuentra liberado, validará si está aprobado por los aprobadores
                                        if (lista_cab_ordenes[i].USR_AP_N1 != undefined && lista_cab_ordenes[i].USR_AP_N1 != "" && lista_cab_ordenes[i].USR_AP_N2 != undefined && lista_cab_ordenes[i].USR_AP_N2 != "") {
                                            //tiene 2 aprobadores el estado liberado, debe tener los dos check
                                            if (lista_cab_ordenes[i].EST_LIB != undefined && lista_cab_ordenes[i].EST_LIB != "XX") {
                                                ind_falta_aprobacion_de_aprobadores = true;
                                                break;
                                            }
                                        }
                                        if (lista_cab_ordenes[i].USR_AP_N1 != undefined && lista_cab_ordenes[i].USR_AP_N1 != "" && (lista_cab_ordenes[i].USR_AP_N2 == undefined || lista_cab_ordenes[i].USR_AP_N2 == "")) {
                                            //tiene 1 aprobador el estado liberado, debe tener los checks
                                            if (lista_cab_ordenes[i].EST_LIB != undefined && (lista_cab_ordenes[i].EST_LIB != "XX" || lista_cab_ordenes[i].EST_LIB != "X.")) {
                                                ind_falta_aprobacion_de_aprobadores = true;
                                                break;
                                            }
                                        }
                                    }
                                }
                                else {
                                    //no analizará rechazados ni borrados
                                }
                            }
                        }

                        if (ind_existe_estado_pendiente) {
                            sap.m.MessageBox.information("Existen anticipos que aún están en proceso, por favor verifique antes de registrar un nuevo anticipo");
                            return;
                        }
                        else if (ind_falta_aprobacion_de_aprobadores) {
                            sap.m.MessageBox.information("Existen anticipos que aún está pendiente la aprobación, por favor verifique antes de registrar un nuevo anticipo");
                            return;
                        } else {
                            console.log("No se encontraron anticipos en proceso, puede continuar");
                        }
                    }
                    else if (v_tip_sol == "ERE") {
                        console.log("GUARDAR ELSE ");

                        var ind_existe_anticipo = false; //Valida su lista de anticipos, si alguno estuviera en proceso o pendiente de liberar, no puede registrar nuevo (entregas a rendir, reembolso no tiene anticipo)

                        if (lista_cab_ordenes != undefined && lista_cab_ordenes.length > 0) {
                            for (var i = 0; i < lista_cab_ordenes.length; i++) {
                                if (lista_cab_ordenes[i].EST_ORD != "R" && lista_cab_ordenes[i].EST_ORD != "B") {
                                    ind_existe_anticipo = true;
                                    break;
                                }
                                else {
                                    //no analizará rechazados ni borrados
                                }
                            }
                        }

                        if (ind_existe_anticipo) {
                            sap.m.MessageBox.information("Existe anticipo ya registrado, no se puede registrar más anticipos");
                            return;
                        }
                        else {
                            console.log("No se encontraron anticipos en proceso, puede continuar");
                        }
                    }
                }
                else if (p_idDialog == "formNuevoLiquidacion" && type == "guardar") { //Acción: Registrar nueva liquidación, 

                    if (v_tip_sol == "CCH" || v_tip_sol.TIP_SOL == "CJC") {
                        var ind_existe_estado_pendiente = false;  //Valida su lista de liquidaciones, si alguno estuviera en proceso o pendiente de ser liquidada, no puede registrar nuevo
                        var ind_falta_aprobacion_de_aprobadores = false; //Valida si falta aprobación por los aprobadores
                        var v_cant_anticipo_aprobado = 0;  //Valida si falta que al menos un anticipo está aprobado

                        //valida en cabeceras de liquidaciones
                        if (lista_cab_liq != undefined && lista_cab_liq.length > 0) {
                            for (var i = 0; i < lista_cab_liq.length; i++) {
                                if (lista_cab_liq[i].EST_LIQ != "R" && lista_cab_liq[i].EST_LIQ != "B") {
                                    //if(lista_cab_liq[i].EST_LIQ != "X") {
                                    if (lista_cab_liq[i].EST_LIQ != "V" && lista_cab_liq[i].EST_LIQ != "X" && lista_cab_liq[i].EST_LIQ != "L") {
                                        //se encuentra en proceso, aún no está liquidado
                                        ind_existe_estado_pendiente = true;
                                        break;
                                    }
                                    //else if(lista_cab_liq[i].EST_LIQ == "X") {
                                    else if (lista_cab_liq[i].EST_LIQ !== "V" || lista_cab_liq[i].EST_LIQ !== 'X' || lista_cab_liq[i].EST_LIQ !== 'L') {

                                        //se encuentra liquidado, validará si está aprobado por los aprobadores
                                        if (lista_cab_liq[i].USR_AP_N1 != undefined && lista_cab_liq[i].USR_AP_N1 != "" && lista_cab_liq[i].USR_AP_N2 != undefined && lista_cab_liq[i].USR_AP_N2 != "") {
                                            //tiene 2 aprobadores el estado liquidado, valida que debe tener los dos check
                                            //if(lista_cab_liq[i].EST_LIB != undefined && lista_cab_liq[i].EST_LIB != "XX"){
                                            if (lista_cab_liq[i].EST_LIB != undefined && lista_cab_liq[i].EST_LIB !== '' && lista_cab_liq[i].EST_LIQ !== "L" && lista_cab_liq[i].EST_LIQ !== 'X' && lista_cab_liq[i].EST_LIQ !== "V" && lista_cab_liq[i].EST_LIB != "XX" && lista_cab_liq[i].EST_LIB !== 'X' && lista_cab_liq[i].EST_LIB !== 'X.') {
                                                ind_falta_aprobacion_de_aprobadores = true;
                                                break;
                                            }
                                        }
                                        if (lista_cab_liq[i].USR_AP_N1 != undefined && lista_cab_liq[i].USR_AP_N1 != "" && (lista_cab_liq[i].USR_AP_N2 == undefined || lista_cab_liq[i].USR_AP_N2 == "")) {
                                            //tiene 1 aprobador el estado liquidado, valida que debe tener los checks
                                            //if(lista_cab_liq[i].EST_LIB != undefined && (lista_cab_liq[i].EST_LIB != "XX" || lista_cab_liq[i].EST_LIB != "X.")){ 
                                            if (lista_cab_liq[i].EST_LIB != undefined && lista_cab_liq[i].EST_LIQ !== "V" && lista_cab_liq[i].EST_LIQ !== "L" && lista_cab_liq[i].EST_LIQ !== 'X' && (lista_cab_liq[i].EST_LIB != "XX" || lista_cab_liq[i].EST_LIB != "X.")) {
                                                ind_falta_aprobacion_de_aprobadores = true;
                                                break;
                                            }
                                        }
                                    }
                                }
                                else {
                                    //no analizará rechazados ni borrados
                                }
                            }
                        }

                        //validación de anticipos: Valida que para regisrar una nueva liquidación en Caja Chica, al menos 1 anticipo debe estar liberado-------
                        for (var i = 0; i < lista_cab_ordenes.length; i++) {
                            if (lista_cab_ordenes[i].EST_ORD == "P" || lista_cab_ordenes[i].EST_ORD == "L") {
                                //se encuentra liberado, validará si está aprobado por los aprobadores
                                if (lista_cab_ordenes[i].USR_AP_N1 != undefined && lista_cab_ordenes[i].USR_AP_N1 != "" && lista_cab_ordenes[i].USR_AP_N2 != undefined && lista_cab_ordenes[i].USR_AP_N2 != "") {
                                    //tiene 2 aprobadores el estado liberado, valida que debe tener los dos check
                                    if (lista_cab_ordenes[i].EST_LIB != undefined && lista_cab_ordenes[i].EST_LIB == "XX") {
                                        v_cant_anticipo_aprobado = v_cant_anticipo_aprobado + 1;
                                        break;
                                    }
                                }
                                if (lista_cab_ordenes[i].USR_AP_N1 != undefined && lista_cab_ordenes[i].USR_AP_N1 != "" && (lista_cab_ordenes[i].USR_AP_N2 == undefined || lista_cab_ordenes[i].USR_AP_N2 == "")) {
                                    //tiene 1 aprobador el estado liberado, valida que debe tener los checks
                                    if (lista_cab_ordenes[i].EST_LIB != undefined && (lista_cab_ordenes[i].EST_LIB == "XX" || lista_cab_ordenes[i].EST_LIB == "X.")) {
                                        v_cant_anticipo_aprobado = v_cant_anticipo_aprobado + 1;
                                        break;
                                    }
                                }
                            }
                        }
                        //------------------------------------------------------------------------------------------------------------------------


                        //if (ind_existe_estado_pendiente == true) {
                        if (ind_existe_estado_pendiente) {
                            sap.m.MessageBox.information("Existen liquidaciones que aún están en proceso, por favor verifique antes de registrar una nueva liquidación");
                            return;
                        }
                        //else if (ind_falta_aprobacion_de_aprobadores == true) {
                        else if (ind_falta_aprobacion_de_aprobadores) {
                            sap.m.MessageBox.information("Existen liquidaciones que aún está pendiente la aprobación, por favor verifique antes de registrar una nueva liquidación");
                            return;
                        }
                        else if (v_cant_anticipo_aprobado == 0) {
                            sap.m.MessageBox.information("Para registrar la liquidación, se requiere al menos 1 anticipo aprobado");
                            return;
                        }
                        else {
                            console.log("No se encontraron liquidaciones en proceso, puede continuar");
                        }
                    }
                    else if (v_tip_sol == "ERE") {
                        var ind_existe_liquidacion = false; //Valida su lista de liquidaciones, si alguno estuviera en proceso o pendiente de liberar, no puede registrar nuevo (entregas a rendir)
                        var v_cant_anticipo_aprobado = 0;  //Valida si falta que al menos un anticipo está aprobado

                        //valida en cabeceras de liquidaciones
                        if (lista_cab_liq != undefined && lista_cab_liq.length > 0) {
                            for (var i = 0; i < lista_cab_liq.length; i++) {
                                if (lista_cab_liq[i].EST_LIQ != "R" && lista_cab_liq[i].EST_LIQ != "B") {
                                    ind_existe_liquidacion = true;
                                    break;
                                }
                                else {
                                    //no analizará rechazados ni borrados
                                }
                            }
                        }

                        //validación de anticipos: Valida que para regisrar una nueva liquidación en ERE, al menos 1 anticipo debe estar liberado-------
                        for (var i = 0; i < lista_cab_ordenes.length; i++) {
                            if (lista_cab_ordenes[i].EST_ORD == "P" || lista_cab_ordenes[i].EST_ORD == "L") {
                                //se encuentra liberado, validará si está aprobado por los aprobadores
                                if (lista_cab_ordenes[i].USR_AP_N1 != undefined && lista_cab_ordenes[i].USR_AP_N1 != "" && lista_cab_ordenes[i].USR_AP_N2 != undefined && lista_cab_ordenes[i].USR_AP_N2 != "") {
                                    //tiene 2 aprobadores el estado liberado, valida que debe tener los dos check
                                    if (lista_cab_ordenes[i].EST_LIB != undefined && lista_cab_ordenes[i].EST_LIB == "XX") {
                                        v_cant_anticipo_aprobado = v_cant_anticipo_aprobado + 1;
                                        break;
                                    }
                                }
                                if (lista_cab_ordenes[i].USR_AP_N1 != undefined && lista_cab_ordenes[i].USR_AP_N1 != "" && (lista_cab_ordenes[i].USR_AP_N2 == undefined || lista_cab_ordenes[i].USR_AP_N2 == "")) {
                                    //tiene 1 aprobador el estado liberado, valida que debe tener los checks
                                    if (lista_cab_ordenes[i].EST_LIB != undefined && (lista_cab_ordenes[i].EST_LIB == "XX" || lista_cab_ordenes[i].EST_LIB == "X.")) {
                                        v_cant_anticipo_aprobado = v_cant_anticipo_aprobado + 1;
                                        break;
                                    }
                                }
                            }
                        }
                        //------------------------------------------------------------------------------------------------------------------------


                        if (ind_existe_liquidacion == true) {
                            sap.m.MessageBox.information("Existe liquidación ya registrada, no se puede registrar más liquidaciones");
                            return;
                        }
                        else if (v_cant_anticipo_aprobado == 0) {
                            sap.m.MessageBox.information("Para registrar la liquidación, se requiere al menos 1 anticipo aprobado");
                            return;
                        }
                        else {
                            console.log("No se encontraron liquidacione en proceso, puede continuar");
                        }
                    }
                    else if (v_tip_sol == "REE") {
                        var ind_existe_liquidacion = false; //Valida su lista de liquidaciones, si alguno estuviera en proceso o pendiente de liberar, no puede registrar nuevo (reembolso)

                        if (lista_cab_liq != undefined && lista_cab_liq.length > 0) {
                            for (var i = 0; i < lista_cab_liq.length; i++) {
                                if (lista_cab_liq[i].EST_LIQ != "R" && lista_cab_liq[i].EST_LIQ != "B") {
                                    ind_existe_liquidacion = true;
                                    break;
                                }
                                else {
                                    //no analizará rechazados ni borrados
                                }
                            }
                        }

                        if (ind_existe_liquidacion == true) {
                            sap.m.MessageBox.information("Existe liquidación ya registrada, no se puede registrar más liquidaciones");
                            return;
                        }
                        else {
                            console.log("No se encontraron liquidacione en proceso, puede continuar");
                        }
                    }
                }

                //Realiza la apertura del fragment-----------
                if (this.ogDialog) { this.ogDialog.destroy(); };
                this.ogDialog = sap.ui.xmlfragment(`${p_idDialog}`, `nsnew.uisemnew.view.fragments.${namespace}`, this);
                oView.addDependent(this.ogDialog);
                /* var oView = this.getView();  
                    if (!this.ogDialog) {
                        this.ogDialog = Fragment.load({
                            id: oView.getId(), 
                            name: "`nsnew.uisemnew.view.fragments." + namespace,
                            controller: this
                        }).then(function (oDialog) {
                            oView.addDependent(oDialog);
                            return oDialog;
                        });
                    }
                    this.ogDialog.then(function (oDialog) {
                        oDialog.open();
                    }.bind(this));   */
                this.ogDialog.setTitle(`${title}`);

                this.ogDialog.open();
                this.dialog_data(type, oData, p_idDialog);
                var oInput = sap.ui.core.Fragment.byId('formNuevoLiquidacion', "txt_nro_comprobante");
                if (oInput != undefined) {
                    //   oInput.attachBrowserEvent("keyup", this.f_onKeyUp_sunat, this);
                }
                //--------------------------------------------
                /*var oSelect = sap.ui.core.Fragment.byId("formNuevoLiquidacion", "cmb_tipo_comprobante");
                        var oSelect_ceco = sap.ui.core.Fragment.byId("formNuevoLiquidacion", "cmb_ceco");
                        if (oSelect) {
                            oSelect.setSelectedKey("default");
                            console.log("oSelect", oSelect);
                        }
                        if (oSelect_ceco) {
                            oSelect_ceco.setSelectedKey("default");
                            console.log("oSelect_eco",oSelect_ceco);
                        }*/
            },
            dialog_data: async function (type, oData, p_idDialog) {
                var oModel = this.getView().getModel("myParam");
                var lista_cab_ordenes = oModel.getProperty("/lista_ord_cab");
                var v_motivo_sol = oModel.getProperty("/solicitud_selected_cab/0/MOT_SOL");

                oModel.setProperty("/detalleLiquidacion", []);
                //console.log("v_motivo_sol");
                //console.log(v_motivo_sol);

                if (type == "guardar") {

                    //inicializa valores
                    if (p_idDialog == "formNuevoAnticipo") {
                        var oCurrentDate = new Date();

                        // sap.ui.core.Fragment.byId('formNuevoAnticipo',"txtDetallePago").setValue(v_motivo_sol);
                        sap.ui.core.Fragment.byId('formNuevoAnticipo', "dtFechaAnticipo").setDateValue(oCurrentDate);

                    }
                    else if (p_idDialog == "formNuevoLiquidacion") {

                        var v_moneda = "";
                        var oCurrentDate = new Date();
                        setTimeout(() => {
                            const inputElement = document.getElementById("formNuevoLiquidacion--file_input_documento-fu_input-inner");
                            // Asignar un placeholder
                            inputElement.placeholder = "(obligatorio) Adjuntar sustento de gasto";
                        }, 1000);


                        sap.ui.core.Fragment.byId('formNuevoLiquidacion', "txt_id_liquidacion").setValue("");
                        sap.ui.core.Fragment.byId('formNuevoLiquidacion', "txt_fecha_liquidacion").setDateValue(oCurrentDate);
                        //sap.ui.core.Fragment.byId('formNuevoLiquidacion',"txt_fecha_gasto").setDateValue(oCurrentDate); 
                        sap.ui.core.Fragment.byId('formNuevoLiquidacion', 'cmb_ceco').setSelectedKey('');
                        sap.ui.core.Fragment.byId('formNuevoLiquidacion', 'cmb_concepto_gasto').setSelectedKey('');

                        if (sap.ui.core.Fragment.byId('formNuevoLiquidacion', "txt_descripcion_liquidacion").getValue() == undefined || sap.ui.core.Fragment.byId('formNuevoLiquidacion', "txt_descripcion_liquidacion").getValue() == "") {
                            //   sap.ui.core.Fragment.byId('formNuevoLiquidacion',"txt_descripcion_liquidacion").setValue(v_motivo_sol);
                        }


                        //valida si hay algun anticipo para obtener moneda de referencia-----------------
                        //sap.ui.core.Fragment.byId('formNuevoLiquidacion',"cmb_moneda_gasto").setEnabled(true); 
                        sap.ui.core.Fragment.byId('formNuevoLiquidacion', "cmb_moneda_gasto").setSelectedKey("");
                        for (var i = 0; i < lista_cab_ordenes.length; i++) {
                            if (lista_cab_ordenes[i].EST_ORD != "R" && lista_cab_ordenes[i].EST_ORD != "B") {
                                //encontró un anticipo de referencia
                                v_moneda = lista_cab_ordenes[i].MON_ORD;
                            }
                        }
                        if (v_moneda == "PEN" || v_moneda == "USD") {
                            sap.ui.core.Fragment.byId('formNuevoLiquidacion', "cmb_moneda_gasto").setEnabled(false);
                            sap.ui.core.Fragment.byId('formNuevoLiquidacion', "cmb_moneda_gasto").setSelectedKey(v_moneda);
                        }
                        //--------------------------------------------------------------------------------
                        sap.ui.core.Fragment.byId('formNuevoLiquidacion', "btn_agregar_item_detalle").setEnabled(true);
                        sap.ui.core.Fragment.byId('formNuevoLiquidacion', "btn_guardar_detalle").setEnabled(true);
                        sap.ui.core.Fragment.byId('formNuevoLiquidacion', "vbox_registro_liquidacion").setVisible(true);

                        //DETALLE BLOQUEAR BOTON EDITAR EN CREAR DETALLE LIQUIDACION
                        var oTable = sap.ui.core.Fragment.byId('formNuevoLiquidacion', "table_detalle_nuevo_liquidacion");
                        var aItems = oTable.getItems();
                        if (aItems) {
                            aItems.forEach(function (oItem) {
                                var oFlexBox = oItem.getCells()[9]; // La última columna que contiene el FlexBox
                                if (oFlexBox != undefined && oFlexBox.getItems() != undefined && oFlexBox.getItems()[1] != undefined) {
                                    oFlexBox.getItems()[1].setEnabled(false); // El botón es el segundo elemento del FlexBox
                                }
                                else {
                                    console.log("no identificó el botón editar para deshabilitar");
                                }
                            });
                        }
                    }
                    else {
                        console.log("p_dialog " + p_idDialog + " no reconocido");
                    }

                }
                if (type == "editar") {
                    sap.ui.core.Fragment.byId('formNuevoLiquidacion', "txt_id_liquidacion").setValue(oData.ID_LIQ);
                    sap.ui.core.Fragment.byId('formNuevoLiquidacion', "txt_fecha_liquidacion").setValue(oData.FEC_LIQ);
                    sap.ui.core.Fragment.byId('formNuevoLiquidacion', "txt_descripcion_liquidacion").setValue(oData.DES_LIQ);

                    sap.ui.core.Fragment.byId('formNuevoLiquidacion', "cmb_concepto_gasto").setSelectedKey("");
                    sap.ui.core.Fragment.byId('formNuevoLiquidacion', "cmb_ceco").setSelectedKey("");



                    //valida si hay algun anticipo para obtener moneda de referencia-----------------
                    //sap.ui.core.Fragment.byId('formNuevoLiquidacion',"cmb_moneda_gasto").setEnabled(true); 
                    sap.ui.core.Fragment.byId('formNuevoLiquidacion', "cmb_moneda_gasto").setSelectedKey("");
                    for (var i = 0; i < lista_cab_ordenes.length; i++) {
                        if (lista_cab_ordenes[i].EST_ORD != "R" && lista_cab_ordenes[i].EST_ORD != "B") {
                            //encontró un anticipo de referencia
                            v_moneda = lista_cab_ordenes[i].MON_ORD;
                        }
                    }
                    if (v_moneda == "PEN" || v_moneda == "USD") {
                        //sap.ui.core.Fragment.byId('formNuevoLiquidacion',"cmb_moneda_gasto").setEnabled(false); 
                        sap.ui.core.Fragment.byId('formNuevoLiquidacion', "cmb_moneda_gasto").setSelectedKey(v_moneda);
                    }
                    //--------------------------------------------------------------------------------


                    sap.ui.core.Fragment.byId('formNuevoLiquidacion', "btn_agregar_item_detalle").setEnabled(true);
                    sap.ui.core.Fragment.byId('formNuevoLiquidacion', "btn_guardar_detalle").setEnabled(true);
                    sap.ui.core.Fragment.byId('formNuevoLiquidacion', "vbox_registro_liquidacion").setVisible(true);

                    //obtiene datos de la liquidación
                    this.f_get_detalle_liquidacion(oData.ID_LIQ, true);
                }
                else if (type == "ver") {
                    sap.ui.core.Fragment.byId('formNuevoLiquidacion', "txt_id_liquidacion").setValue(oData.ID_LIQ);
                    sap.ui.core.Fragment.byId('formNuevoLiquidacion', "txt_fecha_liquidacion").setValue(oData.FEC_LIQ);
                    sap.ui.core.Fragment.byId('formNuevoLiquidacion', "txt_descripcion_liquidacion").setValue(oData.DES_LIQ);

                    sap.ui.core.Fragment.byId('formNuevoLiquidacion', "btn_agregar_item_detalle").setEnabled(false);
                    sap.ui.core.Fragment.byId('formNuevoLiquidacion', "btn_guardar_detalle").setEnabled(false);
                    sap.ui.core.Fragment.byId('formNuevoLiquidacion', "vbox_registro_liquidacion").setVisible(false);

                    //obtiene datos de la liquidación
                    this.f_get_detalle_liquidacion(oData.ID_LIQ, false);

                }
                if (p_idDialog === "NuevaSolicitudDialog") {
                    var fecha_actual = this.f_get_fecha_actual();
                    var fecha_final = fecha_actual.split("-");
                    sap.ui.core.Fragment.byId('NuevaSolicitudDialog', "txt_fecha_solicitud").setDateValue(new Date(fecha_final[0], fecha_final[1] - 1, fecha_final[2]));
                }
            },
            f_get_static_detalle_liquidacion: async function () {
                var regexConceptoGasRestar = /^[rR]/;
                var oModel = this.getView().getModel("myParam");
                var oTable = sap.ui.core.Fragment.byId('formNuevoLiquidacion', "table_detalle_nuevo_liquidacion");
                var aData = [];
                var aData = oModel.getProperty("/detalleLiquidacion");


                var v_total_IMP_GTO = aData.reduce((sum, item) => {
                    if (!regexConceptoGasRestar.test(item.ID_CONCEPTO)) {
                        return sum + parseFloat(item.IMP_GTO);
                    } else {
                        return sum - parseFloat(item.IMP_GTO);
                    }
                }, 0);

                var oTable = sap.ui.core.Fragment.byId('formNuevoLiquidacion', "table_detalle_nuevo_liquidacion");
                if (oTable) {
                    oTable.setHeaderText(`Lista detallada de gastos (${v_total_IMP_GTO.toFixed(2)})`);
                    sap.ui.getCore().applyChanges();
                }
                var lista_cab_ordenes = oModel.getProperty("/lista_ord_cab");
                var v_moneda = ""
                for (var i = 0; i < lista_cab_ordenes.length; i++) {
                    if (lista_cab_ordenes[i].EST_ORD != "R" && lista_cab_ordenes[i].EST_ORD != "B") {
                        //encontró un anticipo de referencia
                        v_moneda = lista_cab_ordenes[i].MON_ORD;
                    }
                }
                if (v_moneda == "PEN" || v_moneda == "USD") {
                    sap.ui.core.Fragment.byId('formNuevoLiquidacion', "cmb_moneda_gasto").setEnabled(false);
                    sap.ui.core.Fragment.byId('formNuevoLiquidacion', "cmb_moneda_gasto").setSelectedKey(v_moneda);
                }
            },
            f_get_detalle_liquidacion: async function (ID, p_ind_boton_activo) {
                var dataRes = null;
                var oModel = this.getView().getModel("myParam");
                var v_url = "";
                var v_det_liq_det = "";
                var v_arr_datos_adjunto_cab = oModel.getProperty("/lista_adj_cab");

                try {
                    //get liquidacion cab
                    v_url = v_url_ini + `/getDetLiq.php?USER=adlira&LIQ=${ID}`;

                    if (ind_conecta_json_sap == "1") {
                        dataRes = await this.f_ajax('GET', v_url, '', oModel.getProperty("/token"));
                        dataRes = JSON.parse(dataRes)
                    }
                    else {
                        dataRes = {
                            "T_LIQ_DET": [
                                { "ID_LIQ": "5", "POS_LIQ": "1", "EST_GTO": "B", "FEC_GTO": "2024-08-31", "ID_CONCEPTO": "6314", "NIF_PROV": "12345678901", "RAZ_PROV": "RIVRECON.SAC", "PAIS_COMP": "PE", "TIP_COMP": "03", "NRO_COMP": "B388-0298926", "IMP_GTO": "45.00", "IMP_GTO_S": "100", "MON_GTO": "PEN", "MON_GTO_S": "", "IND_IVA": "", "DESC_GTO": "Almuerzo", "ERP_OBJTYPE": "", "ERP_OBJKEY": null, "AREA": null, "OBJ_CO": null, "USR_CREA": null, "FEC_CREA": "2024-09-23", "USR_MOD": "2024-09-23", "FEC_MOD": "2024-09-23" },
                                { "ID_LIQ": "6", "POS_LIQ": "1", "EST_GTO": "B", "FEC_GTO": "2024-08-31", "ID_CONCEPTO": "6314", "NIF_PROV": "12345678901", "RAZ_PROV": "RIVRECON.SAC", "PAIS_COMP": "PE", "TIP_COMP": "03", "NRO_COMP": "B388-0298936", "IMP_GTO": "45.00", "IMP_GTO_S": "100", "MON_GTO": "PEN", "MON_GTO_S": "", "IND_IVA": "", "DESC_GTO": "Almuerzo", "ERP_OBJTYPE": "", "ERP_OBJKEY": null, "AREA": null, "OBJ_CO": null, "USR_CREA": null, "FEC_CREA": "2024-09-23", "USR_MOD": "2024-09-23", "FEC_MOD": "2024-09-23" }
                            ]
                        };
                    }
                    if (dataRes != undefined && dataRes[0] != undefined && dataRes[0].type != undefined && dataRes[0].type == "E") {
                        if (dataRes[0].MESSAGE == undefined) { MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor"); }
                        else { MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor (" + dataRes[0].MESSAGE + ")"); }
                        return;
                    } else {

                        var regexConceptoGasto = /^6/;
                        var regexConceptoGasRestar = /^[rR]/;

                        var v_total_IMP_GTO = dataRes.T_LIQ_DET.reduce((sum, item) => {
                            if (!regexConceptoGasRestar.test(item.ID_CONCEPTO)) {
                                return sum + parseFloat(item.IMP_GTO);
                            } else {
                                return sum - parseFloat(item.IMP_GTO);
                            }
                        }, 0);

                        var oTable = sap.ui.core.Fragment.byId('formNuevoLiquidacion', "table_detalle_nuevo_liquidacion");
                        if (oTable) {
                            oTable.setHeaderText(`Lista detallada de gastos (${v_total_IMP_GTO.toFixed(2)})`);
                            sap.ui.getCore().applyChanges();
                        }


                        v_det_liq_det = dataRes.T_LIQ_DET;

                        for (var i = 0; i < v_det_liq_det.length; i++) {
                            v_det_liq_det[i].visible_ADJ = false;
                            for (var j = 0; j < v_arr_datos_adjunto_cab.length; j++) {
                                if (v_det_liq_det[i].ID_LIQ == v_arr_datos_adjunto_cab[j].ID_LIQ && v_det_liq_det[i].POS_LIQ == v_arr_datos_adjunto_cab[j].POS_LIQ && v_arr_datos_adjunto_cab[j].B64 != undefined && v_arr_datos_adjunto_cab[j].B64 != "") {
                                    v_det_liq_det[i].B64 = v_arr_datos_adjunto_cab[j].B64;
                                    v_det_liq_det[i].DESC_ADJ = v_arr_datos_adjunto_cab[j].DESC_ADJ;
                                    v_det_liq_det[i].visible_ADJ = true;
                                }
                            }
                        }


                        sap.ui.getCore().applyChanges();

                        oModel.setProperty("/detalleLiquidacion", v_det_liq_det);

                        // JP 15/01/202
                        if (p_ind_boton_activo == false) {
                            //setea los botones como eliminar a falso
                            var oTable = sap.ui.core.Fragment.byId('formNuevoLiquidacion', "table_detalle_nuevo_liquidacion");
                            var aItems = oTable.getItems();
                            aItems.forEach(function (oItem) {
                                var oFlexBox = oItem.getCells()[9]; // La última columna que contiene el FlexBox
                                if (oFlexBox != undefined && oFlexBox.getItems() != undefined && oFlexBox.getItems()[0] != undefined) {
                                    oFlexBox.getItems()[0].setEnabled(false); // El botón es el primer elemento del FlexBox
                                }
                                else {
                                    console.log("no identificó el botón eliminar para deshabilitar");
                                }
                            });
                        }
                        sap.ui.getCore().applyChanges();
                    }
                } catch (error) {
                    if (error == undefined) {
                        MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor");
                    }
                    else {
                        if (error.descripcion != undefined) { MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor (" + error.descripcion + ")"); }
                        else if (error.message != undefined) { MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor (" + error.message + ")"); }
                        else { MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor"); }
                    }
                    return;
                }
            },
            f_descargar_base64: function (oEvent) {

                // Obtener el contexto del elemento de la tabla que fue clickeado
                var oItem = oEvent.getSource().getParent();  // El botón es hijo del FlexBox, subimos un nivel al ColumnListItem
                var oBindingContext = oItem.getBindingContext("myParam");  // Obtiene el contexto vinculado al modelo 'myParam'

                var v_nombre_fichero = oBindingContext.getProperty("DESC_ADJ");
                var v_base64_local = oBindingContext.getProperty("B64");        //base64 del cargado local
                var v_base64_adj_web = oBindingContext.getProperty("B64");  //base64 de la web
                var v_base64_descarga;

                // Comprobar si el base64 existe
                if (!v_base64_local && !v_base64_adj_web) {
                    sap.m.MessageToast.show("No hay archivo adjunto para descargar.");
                    return;
                }

                if (!v_base64_local) {
                    v_base64_descarga = v_base64_adj_web;
                }
                else {
                    v_base64_descarga = v_base64_local;
                }


                /*
                // Detectar el tipo MIME desde el Base64 si tiene el prefijo 'data:image/jpeg;base64,'
                var mimeRegex = /^data:(.+);base64,/;
                var match = v_base64_descarga.match(mimeRegex);
                var sMimeType = "application/octet-stream";  // Tipo MIME predeterminado
                var sExtension = "";  // Variable para la extensión del archivo
    
                if (match) {
                    sMimeType = match[1];  // Extraer el tipo MIME del Base64
                    v_base64_descarga = v_base64_descarga.replace(mimeRegex, '');  // Remover el prefijo de la cadena Base64
    
                    // Determinar la extensión del archivo según el tipo MIME
                    if (sMimeType == 'image/jpeg') {
                        sExtension = 'jpg';
                    } else if (sMimeType == 'image/png') {
                        sExtension = 'png';
                    } else if (sMimeType == 'application/pdf') {
                        sExtension = 'pdf';
                    }
                    else {
                        sExtension = 'bin';
                    }
                }
                else {
                    // Si no se detecta el MIME type, usar un nombre y extensión genéricos
                    sMimeType = "application/octet-stream";  // MIME genérico
                    sExtension = "bin";  // Extensión genérica
                }
    
                // Crear un nombre de archivo genérico con extensión
                var sFileName = "archivo_descargado" + (sExtension ? "." + sExtension : "");
                */

                // Crear un enlace temporal para descargar el archivo
                var link = document.createElement("a");
                //link.href = "data:" + sMimeType + ";base64," + v_base64_descarga;
                link.href = "data:application/octet-stream;base64," + v_base64_descarga;
                //link.download = sFileName;  
                link.download = v_nombre_fichero;
                link.click();

                // Limpieza
                link.remove();

            },
            f_ver_detalle: function (oEvent) {
                var oModel = this.getView().getModel("myParam");
                var oButton = oEvent.getSource();
                var oListItem = oButton.getParent().getParent();
                //var oContext = oListItem.getBindingContext("myParam");   
                var oBindingContext = oListItem.getBindingContext("myParam");
                var oData = oBindingContext.getObject();
                //console.log("oData", oData);
                this.f_dialog_show('formNuevoLiquidacion', 'FormNuevoLiquidacion', 'Detalle liquidacion gastos', 'ver', oData);
            },
            f_editar_detalle: function (oEvent) {
                var oModel = this.getView().getModel("myParam");
                var oButton = oEvent.getSource();
                var oListItem = oButton.getParent().getParent();
                //var oContext = oListItem.getBindingContext("myParam");   
                var oBindingContext = oListItem.getBindingContext("myParam");
                var oData = oBindingContext.getObject();
                //console.log("oData", oData);

                //valida estado, solo puede eliminar si está en estado creado
                if (oData.EST_LIQ != "C") {
                    sap.m.MessageBox.information("No puede realizar la acción, verifique el estado");
                    return;
                }
                this.f_dialog_show('formNuevoLiquidacion', 'FormNuevoLiquidacion', 'Editar Detalle liquidacion gastos', 'editar', oData);
            },
            f_refresca_montos_calculados: async function () {
                console.log("refresca montos");
                var oModel = this.getView().getModel("myParam");

                var lista_cab_liq = oModel.getProperty("/lista_liquidacion_cab");
                var lista_cab_ordenes = oModel.getProperty("/lista_ord_cab");

                var v_importe_liq_sum = 0;
                var v_importe_ord = 0;

                var v_url = "";
                var dataRes;

                for (var i = 0; i < lista_cab_liq.length; i++) {
                    if (lista_cab_liq[i].EST_LIQ != "R" && lista_cab_liq[i].EST_LIQ != "B") {

                        //busca dealle de liquidación
                        try {
                            //get liquidacion cab
                            v_url = v_url_ini + `/getDetLiq.php?USER=adlira&LIQ=${lista_cab_liq[i].ID_LIQ}`;
                            if (ind_conecta_json_sap == "1") {
                                dataRes = await this.f_ajax('GET', v_url, '', oModel.getProperty("/token"));

                                if (dataRes != undefined) {
                                    dataRes = JSON.parse(dataRes);

                                } else {
                                    MessageToast.show("Error en la respuesta del servidor, póngase en contacto con el proveedor");
                                    return;
                                }
                            }
                            else {
                                dataRes = { "T_LIQ_DET": [{ "ID_LIQ": "2", "POS_LIQ": "1", "EST_GTO": "B", "FEC_GTO": "2024-08-31", "ID_CONCEPTO": "6314", "NIF_PROV": "12345678901", "RAZ_PROV": null, "PAIS_COMP": "PE", "TIP_COMP": "03", "NRO_COMP": "B388-0298927", "IMP_GTO": "45.00", "IMP_GTO_S": null, "MON_GTO": null, "MON_GTO_S": null, "IND_IVA": null, "DESC_GTO": "Almuerzo", "ERP_OBJTYPE": null, "ERP_OBJKEY": null, "AREA": null, "OBJ_CO": null, "USR_CREA": null, "FEC_CREA": null, "USR_MOD": null, "FEC_MOD": null }] };
                            }
                            if (dataRes != undefined && dataRes[0] != undefined && dataRes[0].type != undefined && dataRes[0].type == "E") {
                                if (dataRes[0].MESSAGE == undefined) { MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor"); }
                                else { MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor (" + dataRes[0].MESSAGE + ")"); }
                                return;
                            } else {


                                //var regexConceptoGasto = /^6/; 
                                var regexConceptoGasRestar = /^[rR]/;

                                var v_importe_liq_sum = dataRes.T_LIQ_DET.reduce((sum, item) => {
                                    if (!regexConceptoGasRestar.test(item.ID_CONCEPTO)) {
                                        return sum + parseFloat(item.IMP_GTO);
                                    } else {
                                        return sum - parseFloat(item.IMP_GTO);
                                    }
                                }, 0);

                                /*
                                for(var j = 0; j < dataRes.T_LIQ_DET.length; j++) {
                                    v_importe_liq_sum = v_importe_liq_sum + dataRes.T_LIQ_DET[j].IMP_GTO*1.0;
                                }
                                */
                            }
                        } catch (error) {
                            if (error == undefined) {
                                MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor");
                            }
                            else {
                                if (error.descripcion != undefined) { MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor (" + error.descripcion + ")"); }
                                else if (error.message != undefined) { MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor (" + error.message + ")"); }
                                else { MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor"); }
                            }
                            return;
                        }
                    }
                }

                for (var i = 0; i < lista_cab_ordenes.length; i++) {
                    if (lista_cab_ordenes[i].EST_ORD != "R" && lista_cab_ordenes[i].EST_ORD != "B") {
                        //encontró anticipos válidos, sumará
                        v_importe_ord = v_importe_ord + lista_cab_ordenes[i].IMP_ORD * 1.0;
                    }
                }
                oModel.setProperty("/importe_liq_sum", v_importe_liq_sum);
                this.byId("txt_obj_calculo_monto_anticipo").setText(v_importe_ord);
                this.byId("txt_obj_calculo_monto_liquidado").setText(v_importe_liq_sum);
            },
            f_press_tabla_eliminar_liquidacion: async function (oEvent) {
                var dataRes;
                var oModel = this.getView().getModel("myParam");
                var oButton = oEvent.getSource();
                var oListItem = oButton.getParent().getParent();
                var oBindingContext = oListItem.getBindingContext("myParam");
                var oData = oBindingContext.getObject();
                //console.log("oData", oData);

                //valida estado, solo puede eliminar si está en estado creado
                if (oData.EST_LIQ != "C") {
                    sap.m.MessageBox.information("No puede realizar la acción, verifique el estado");
                    return;
                }

                let ok = await this.MessageBoxPress('information', "Está seguro que quieres eliminar el registro?")
                if (ok) {
                    console.log("OK", ok);

                    try {
                        const url = v_url_ini + "/postLiq.php";

                        if (ind_conecta_json_sap == "1") {
                            let data = {
                                METHOD: "D",
                                ID_LIQ: oData.ID_LIQ
                            }
                            dataRes = await this.f_ajax('POST', url, data, oModel.getProperty("/token"));
                        } else {
                            dataRes = "Record deleted successfully";
                        }

                        if (dataRes != undefined && dataRes[0] != undefined && dataRes[0].type != undefined && dataRes[0].type == "E") {
                            if (dataRes[0].MESSAGE == undefined) { MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor"); }
                            else { MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor (" + dataRes[0].MESSAGE + ")"); }
                            return;
                        } else {
                            //if(dataRes == "Record deleted successfully") { 
                            sap.m.MessageBox.information("Liquidación borrada correctamente");
                            this.f_get_det_sol_liq_ord();
                            //} else { 
                            //    MessageToast.show("Error en la respuesta del servidor, póngase en contacto con el proveedor"); 
                            //    return;
                            //}  
                        }
                    } catch (error) {
                        if (error == undefined) {
                            MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor");
                        }
                        else {
                            if (error.descripcion != undefined) { MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor (" + error.descripcion + ")"); }
                            else if (error.message != undefined) { MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor (" + error.message + ")"); }
                            else { MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor"); }
                        }
                        return;
                    }
                }
            },
            f_press_tabla_liberar_liquidacion: async function (oEvent) {
                var dataRes;
                var oModel = this.getView().getModel("myParam");
                var oButton = oEvent.getSource();
                var oListItem = oButton.getParent().getParent();
                var oBindingContext = oListItem.getBindingContext("myParam");
                var oData = oBindingContext.getObject();
                //console.log("oData", oData);


                if (oData.EST_LIQ != "C") {
                    sap.m.MessageBox.information("No puede realizar la acción, verifique el estado");
                    return;
                }
                //lista_liquidacion_cab 
                //console.log("oData", oData)
                var solicitud_orden = oModel.getProperty("/lista_ord_cab");
                var solicitud_selected_cab = oModel.getProperty("/solicitud_selected_cab/0");



                if (solicitud_selected_cab.TIP_SOL === "ERE" && solicitud_orden.length > 0) {
                    this.f_refresca_montos_calculados()
                    var v_importe_liq_sum = oModel.getProperty("/importe_liq_sum");
                    //console.log("total", v_importe_liq_sum); 
                    if (parseInt(solicitud_orden[0].IMP_ORD) !== parseInt(v_importe_liq_sum)) {
                        sap.m.MessageBox.information("Por favor, valide el saldo del importe tiene que ser igual al anticipo");
                        return;
                    }
                }
                let ok = await this.MessageBoxPress('information', "Está seguro que quieres liberar el registro?")
                if (ok) {


                    try {
                        const url = v_url_ini + "/postLiq.php";

                        if (ind_conecta_json_sap == "1") {
                            let data = {
                                METHOD: "L",
                                ID_LIQ: oData.ID_LIQ
                            }
                            dataRes = await this.f_ajax('POST', url, data, oModel.getProperty("/token"));
                            //console.log("DATARES", dataRes)
                        } else {
                            dataRes = "Record updated successfully";
                        }

                        if (dataRes != undefined && dataRes[0] != undefined && dataRes[0].type != undefined && dataRes[0].type == "E") {
                            if (dataRes[0].MESSAGE == undefined) { MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor"); }
                            else { MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor (" + dataRes[0].MESSAGE + ")"); }
                            return;
                        } else {
                            //if(dataRes.trim() === "Record updated successfully") { 
                            sap.m.MessageBox.information("Acción realizada correctamente");
                            this.f_get_det_sol_liq_ord();
                            //} else { 
                            //    MessageToast.show("Error en la respuesta del servidor, póngase en contacto con el proveedor"); 
                            //    return;
                            //}
                        }
                    } catch (error) {
                        if (error == undefined) {
                            MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor");
                        }
                        else {
                            if (error.descripcion != undefined) { MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor (" + error.descripcion + ")"); }
                            else if (error.message != undefined) { MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor (" + error.message + ")"); }
                            else { MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor"); }
                        }
                        return;
                    }
                }
            },
            f_press_tabla_eliminar_anticipo: async function (oEvent) {
                var dataRes;
                var oModel = this.getView().getModel("myParam");
                var oButton = oEvent.getSource();
                var oListItem = oButton.getParent().getParent();
                var oBindingContext = oListItem.getBindingContext("myParam");
                var oData = oBindingContext.getObject();
                //console.log("oData", oData);

                //valida estado, solo puede eliminar si está en estado creado
                if (oData.EST_ORD != "C") {
                    sap.m.MessageBox.information("No puede realizar la acción, verifique el estado");
                    return;
                }

                let ok = await this.MessageBoxPress('information', "Está seguro que quieres eliminar el registro?")
                if (ok) {
                    try {
                        const url = v_url_ini + "/postAnt.php";


                        if (ind_conecta_json_sap == "1") {
                            var data = { METHOD: "D", ID_ORD: oData.ID_ORD }
                            dataRes = await this.f_ajax('POST', url, data, oModel.getProperty("/token"));
                        } else {
                            dataRes = "Record deleted successfully";
                        }
                        if (dataRes != undefined && dataRes[0] != undefined && dataRes[0].type != undefined && dataRes[0].type == "E") {
                            if (dataRes[0].MESSAGE == undefined) { MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor"); }
                            else { MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor (" + dataRes[0].MESSAGE + ")"); }
                            return;
                        } else {
                            //if(dataRes == "Record deleted successfully") { 
                            sap.m.MessageBox.information("Anticipo borrado correctamente");
                            this.f_get_det_sol_liq_ord();
                            //} else { 
                            //    MessageToast.show("Error en la respuesta del servidor, póngase en contacto con el proveedor"); 
                            //    return;
                            //}  
                        }
                    } catch (error) {
                        if (error == undefined) {
                            MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor");
                        }
                        else {
                            if (error.descripcion != undefined) { MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor (" + error.descripcion + ")"); }
                            else if (error.message != undefined) { MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor (" + error.message + ")"); }
                            else { MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor"); }
                        }
                        return;
                    }
                }
            },
            MessageBoxPress: function (typeMsm, titleMsm) {
                return new Promise((resolve, reject) => {
                    sap.m.MessageBox[typeMsm](titleMsm, {
                        title: "Mensaje de confirmacion",
                        actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                        emphasizedAction: sap.m.MessageBox.Action.OK,
                        onClose: function (sAction) {
                            let res = false
                            if (sAction == sap.m.MessageBox.Action.OK) {
                                res = true
                            }
                            resolve(res);
                        }
                    });
                });
            },
            f_logout: function () {
                window.location.replace('./logout');
            },
            getRouter: function () {
                return sap.ui.core.UIComponent.getRouterFor(this);
            },
            //FUNCIONES GENERALES  f_AjaxPost: f_AjaxGet:
            f_ajax: function (metodo, url, dataForm = undefined, p_token = undefined) {

                var that = this;

                return new Promise((resolve, reject) => {
                    var ajaxConfig = {
                        type: metodo,
                        url: url,
                        headers: {
                            "X-CSRF-Token": p_token,
                            //"Authorization": "Bearer " + p_token
                        },
                        success: function (result) {
                            resolve(result);
                        },
                        error: function (error) {
                            var str_error = '';
                            console.log('error_rev'); console.log(error);
                            if (error.responseJSON != undefined && error.responseJSON.ITAB != undefined) {
                                for (var i = 0; i < error.responseJSON.ITAB.length; i++) {
                                    if (str_error == '') {
                                        str_error = error.responseJSON.ITAB[i].MESSAGE;
                                    } else {
                                        str_error = str_error + "; " + error.responseJSON.ITAB[i].MESSAGE;
                                    }
                                }
                            } else {
                                console.log('error'); console.log(error);
                                if (error.status != undefined) {
                                    if (error.status == "401") {
                                        sap.m.MessageBox.information("No autorizado para realizar la acción, por favor ingrese nuevamente con un usuario autorizado");
                                        that.f_logout();
                                        return;
                                    }
                                    else {
                                        //if(error.responseText != undefined && error.statusText != undefined) {str_error = "Mensaje " + error.status + " (" + error.responseText + " - " + error.statusText + ")";}
                                        //else if(error.responseText != undefined) {str_error = "Mensaje " + error.status + " (" + error.responseText + ")";} 
                                        //else 
                                        if (error.statusText != undefined) { str_error = "Mensaje " + error.status + " (" + error.statusText + ")"; }
                                        else { str_error = "Mensaje " + error.status }
                                    }
                                }
                                else {
                                    //if(error.responseText != undefined && error.statusText != undefined) {str_error = "Mensaje (" + error.responseText + " - " + error.statusText + ")";} 
                                    //else if(error.responseText != undefined) {str_error = "Mensaje (" + error.responseText + ")";} 
                                    //else 
                                    if (error.statusText != undefined) { str_error = "Mensaje (" + error.statusText + ")"; }
                                    else { str_error = "Mensaje" }
                                }
                            }
                            var errorObj = { cod: 'Error', descripcion: str_error, descripcion_error: error };
                            reject(errorObj);
                        }
                    };

                    if (metodo == 'POST') {
                        ajaxConfig.type = 'POST';
                        ajaxConfig.data = dataForm ? JSON.stringify(dataForm) : undefined;
                    }

                    $.ajax(ajaxConfig);
                });
            },
            f_ajax_aws: function (metodo, url, dataForm = undefined, p_token = undefined) {

                return new Promise((resolve, reject) => {
                    var ajaxConfig = {
                        type: metodo,
                        url: url,
                        headers: {
                            "Authorization": "Basic " + btoa('testweb' + ":" + 'Websmart123.')
                        },
                        success: function (result) {
                            resolve(result);
                        },
                        error: function (error) {
                            var str_error = '';
                            console.log('error_rev'); console.log(error);
                            if (error.responseJSON != undefined && error.responseJSON.ITAB != undefined) {
                                for (var i = 0; i < error.responseJSON.ITAB.length; i++) {
                                    if (str_error == '') {
                                        str_error = error.responseJSON.ITAB[i].MESSAGE;
                                    } else {
                                        str_error = str_error + "; " + error.responseJSON.ITAB[i].MESSAGE;
                                    }
                                }
                            } else {
                                if (error.statusText != undefined) { str_error = "Mensaje (" + error.statusText + ")"; }
                                else { str_error = "Mensaje" }
                            }
                            var errorObj = { cod: 'Error', descripcion: str_error };
                            reject(errorObj);
                        }
                    };

                    if (metodo == 'POST') {
                        ajaxConfig.type = 'POST';
                        ajaxConfig.data = dataForm ? dataForm : undefined;
                    }

                    $.ajax(ajaxConfig);
                });
            },
            f_reg_anticipo: async function () {
                var dataRes = null;
                var oModel = this.getView().getModel("myParam");
                var btnRegAnticipo = sap.ui.core.Fragment.byId('formNuevoAnticipo', "btnRegAnticipo");
                btnRegAnticipo.setEnabled(false);

                try {
                    const url = v_url_ini + "/postAnt.php";
                    var oBindingContext = this.getView().byId("objHeaderSolicitud").getBindingContext("myParam");
                    var v_id_sol = oBindingContext.getProperty("ID_SOL");
                    var v_tip_sol = oBindingContext.getProperty("TIP_SOL");
                    var v_sociedad = oModel.getProperty("/empresa_seleccionada");

                    var v_fecha_ord = sap.ui.core.Fragment.byId('formNuevoAnticipo', "dtFechaAnticipo").getValue();
                    var v_importe_ord = sap.ui.core.Fragment.byId('formNuevoAnticipo', "inputImporte").getValue();
                    var v_moneda_ord = sap.ui.core.Fragment.byId('formNuevoAnticipo', "cmbImporteMoneda").getSelectedKey();
                    var v_desc_ord = sap.ui.core.Fragment.byId('formNuevoAnticipo', "txtDetallePago").getValue();

                    //validaciones genéricas-------
                    if (v_fecha_ord == undefined || v_fecha_ord == "") {
                        sap.m.MessageBox.information("Por favor, valide la fecha de anticipo");
                        btnRegAnticipo.setEnabled(true);
                        return;
                    }
                    if (v_importe_ord == undefined || v_importe_ord == "") {
                        sap.m.MessageBox.information("Por favor, valide el importe de anticipo");
                        btnRegAnticipo.setEnabled(true);
                        return;
                    }
                    if (v_moneda_ord == undefined || v_moneda_ord == "") {
                        sap.m.MessageBox.information("Por favor, valide la moneda de anticipo");
                        btnRegAnticipo.setEnabled(true);
                        return;
                    }
                    if (v_desc_ord == undefined || v_desc_ord == "") {
                        sap.m.MessageBox.information("Por favor, valide la descripción de anticipo");
                        btnRegAnticipo.setEnabled(true);
                        return;
                    }
                    var oInputDate = new Date(v_fecha_ord.split("-")[0], v_fecha_ord.split("-")[1] - 1, v_fecha_ord.split("-")[2]); // Convertir a objeto Date
                    var oCurrentDate = new Date();
                    oCurrentDate.setHours(0, 0, 0, 0);
                    //console.log('oInputDate', oInputDate); 
                    //console.log('oCurrentDate', oCurrentDate);
                    if (!(oInputDate.getTime() === oCurrentDate.getTime())) {
                        sap.m.MessageBox.information("Por favor, la fecha ingresada no es igual a la del día de hoy");
                        btnRegAnticipo.setEnabled(true);
                        return;
                    }
                    //------------------------------

                    //Validaciones personalizadass--
                    if (v_tip_sol == "ERE" || v_tip_sol == "REE") {
                        if (v_importe_ord < 0) {
                            sap.m.MessageBox.information("Por favor, valide el monto del anticipo, no puede ser negativo");
                            btnRegAnticipo.setEnabled(true);
                            return;
                        }
                    }
                    //------------------------------


                    if (ind_conecta_json_sap == "1") {
                        let data = {
                            METHOD: "C",
                            ID_SOL: v_id_sol,
                            EST_ORD: "C",
                            FEC_ORD: v_fecha_ord,
                            IMP_ORD: v_importe_ord,
                            MON_ORD: v_moneda_ord,
                            DES_ORD: v_desc_ord,
                            //EST_LIB: "P",
                            SOCIEDAD: v_sociedad
                        };

                        dataRes = await this.f_ajax('POST', url, data, oModel.getProperty("/token"));
                        //console.log("dataRes", dataRes);
                    } else {
                        dataRes = "New record created successfully";
                        btnRegAnticipo.setEnabled(true);

                    }

                    if (dataRes != undefined && dataRes[0] != undefined && dataRes[0].type != undefined && dataRes[0].type == "E") {
                        if (dataRes[0].MESSAGE == undefined) { MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor"); }
                        else { MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor (" + dataRes[0].MESSAGE + ")"); }
                        btnRegAnticipo.setEnabled(true);
                        return;
                    } else {
                        //if(dataRes == "New record created successfully") { 
                        sap.m.MessageBox.information("Anticipo creado correctamente");
                        this.ogDialog.destroy();
                        this.f_get_det_sol_liq_ord();
                        btnRegAnticipo.setEnabled(true);
                        //} else { 
                        //    MessageToast.show("Error en la respuesta del servidor, póngase en contacto con el proveedor"); 
                        //    return;
                        //}  
                    }
                } catch (error) {
                    btnRegAnticipo.setEnabled(true);
                    if (error == undefined) {
                        MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor");
                    }
                    else {
                        if (error.descripcion != undefined) { MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor (" + error.descripcion + ")"); }
                        else if (error.message != undefined) { MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor (" + error.message + ")"); }
                        else { MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor"); }
                    }
                    return;
                }
            },
            f_reg_nueva_liquidacion: async function () {
                var dataRes = null;
                try {

                    var url = v_url_ini + "/postLiq.php";

                    if (ind_conecta_json_sap == "1") {
                        //console.log("dsadasd"); 
                        var btn_guardar_detalle = sap.ui.core.Fragment.byId('formNuevoLiquidacion', "btn_guardar_detalle");
                        btn_guardar_detalle.setEnabled(false)

                        var oModel = this.getView().getModel("myParam");
                        var v_items_detalle_liquidacion = oModel.getProperty("/detalleLiquidacion");
                        //var v_obj_solicitud_seleccionada = oModel.getProperty("/solicitudSeleccionada"); 
                        var v_obj_solicitud_seleccionada = oModel.getProperty("/solicitud_selected_cab/0");
                        var v_sociedad = oModel.getProperty("/empresa_seleccionada");

                        var v_id_liquidacion = sap.ui.core.Fragment.byId('formNuevoLiquidacion', "txt_id_liquidacion").getValue();
                        var v_fecha_liquidacion = sap.ui.core.Fragment.byId('formNuevoLiquidacion', "txt_fecha_liquidacion").getValue();
                        var v_descripcion_liqidacion = sap.ui.core.Fragment.byId('formNuevoLiquidacion', "txt_descripcion_liquidacion").getValue();

                        var LIQ_DET = [];
                        var POS_LIQ = 0;
                        var data;

                        v_items_detalle_liquidacion.forEach(item => {
                            POS_LIQ = POS_LIQ + 1;
                            item.POS_LIQ = `${POS_LIQ}`
                            LIQ_DET.push(item)
                        });

                        if (LIQ_DET.length == 0) {
                            sap.m.MessageBox.information("Detalle de liquidación se encuentra vacío");
                            btn_guardar_detalle.setEnabled(true);
                            return;
                        }

                        if (v_id_liquidacion == "") {
                            //graba una nueva liquidación
                            data = {
                                "METHOD": "C",
                                "ID_SOL": v_obj_solicitud_seleccionada.ID_SOL,
                                "DES_LIQ": v_descripcion_liqidacion,
                                "EST_LIQ": "C",
                                "FEC_LIQ": v_fecha_liquidacion,
                                "SOCIEDAD": v_sociedad,
                                "LIQ_DET": LIQ_DET
                            }
                        }
                        else {
                            //graba una liquidación existente
                            data = {
                                "METHOD": "U",
                                "ID_LIQ": v_id_liquidacion,
                                "ID_SOL": v_obj_solicitud_seleccionada.ID_SOL,
                                "DES_LIQ": v_descripcion_liqidacion,
                                "EST_LIQ": "C",
                                "FEC_LIQ": v_fecha_liquidacion,
                                "SOCIEDAD": v_sociedad,
                                "LIQ_DET": LIQ_DET
                            }
                        }

                        //console.log("DATA", data);
                        dataRes = await this.f_ajax('POST', url, data, oModel.getProperty("/token"));
                        //console.log("dataRes", dataRes);
                    }
                    else {
                        dataRes = "New record created successfully";
                        btn_guardar_detalle.setEnabled(true);
                    }
                    if (dataRes != undefined && dataRes[0] != undefined && dataRes[0].type != undefined && dataRes[0].type == "E") {
                        if (dataRes[0].MESSAGE == undefined) { MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor"); }
                        else { MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor (" + dataRes[0].MESSAGE + ")"); }
                        btn_guardar_detalle.setEnabled(true);
                        return;
                    } else {
                        //if(dataRes == "New record created successfully" || dataRes == "Record updated successfully") { 
                        sap.m.MessageBox.information("Liquidación guardada preliminarmente");
                        this.f_get_det_sol_liq_ord();
                        btn_guardar_detalle.setEnabled(true)

                        //} else { 
                        //    MessageToast.show("Error en la respuesta del servidor, póngase en contacto con el proveedor 0"); 
                        //    return;
                        //}  
                    }
                } catch (error) {
                    btn_guardar_detalle.setEnabled(true)
                    if (error == undefined) {
                        MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor 1");
                    }
                    else {
                        if (error.descripcion != undefined) { MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor.  (" + error.descripcion + ")"); }
                        else if (error.message != undefined) { MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor. (" + error.message + ")"); }
                        else { MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor."); }
                    }
                    return;
                }
            },
            /*
            f_eliminar_liquidacion: async function() {
                var dataRes = null;
                var oModel = this.getView().getModel("myParam"); 
                var item = this.getView().byId("table_liquidacion").getSelectedItem();
                             
                //validaciones para eliminación-----------
                if (!item) { 
                    sap.m.MessageBox.information("Debe seleccionar al menos 1 registro.");
                    return;
                } 
                else {
    
                    var objeto = item.getBindingContext("myParam").getObject();
    
                    //valida estado, solo puede eliminar si está en estado creado
                    if(objeto.EST_LIQ != "C") {
                        sap.m.MessageBox.information("No puede realizar la acción, verifique el estado");
                        return;
                    }
                }
                //-----------------------------------------
                
                let ok = await this.MessageBoxPress('information', "Está seguro que quieres eliminar el registro?")
                if(ok) {
                    console.log("OK", ok);
                     
                    try {
                        const url = v_url_ini + "/postLiq.php";  
                         
                        if(ind_conecta_json_sap == "1") {
                            let data = { 
                                METHOD: "D", 
                                ID_LIQ: objeto.ID_LIQ
                            } 
                            dataRes = await this.f_ajax('POST', url, data, oModel.getProperty("/token"));   
                        } else { 
                           dataRes = "Record deleted successfully";
                        }
    
                        if(dataRes != undefined && dataRes[0] != undefined && dataRes[0].type != undefined && dataRes[0].type == "E") {
                            if(dataRes[0].MESSAGE == undefined){ MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor"); }
                            else { MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor (" + dataRes[0].MESSAGE + ")");  }
                            return;
                        } else {  
                            //if(dataRes == "Record deleted successfully") { 
                                //MessageToast.show(`Liquidación borrado correctamente`);  
                                sap.m.MessageBox.information("Liquidación borrada correctamente");
                                this.f_get_det_sol_liq_ord();
                            //} else { 
                            //    MessageToast.show("Error en la respuesta del servidor, póngase en contacto con el proveedor"); 
                            //    return;
                            //}  
                        } 
                    } catch(error) {
                        if(error == undefined){ 
                            MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor");
                        }
                        else { 
                            if(error.descripcion != undefined) { MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor (" + error.descripcion + ")"); }
                            else if(error.message != undefined) { MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor (" + error.message + ")"); }
                            else { MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor"); }                            
                        }
                        return;
                    }  
                } 
            },
            */
            /*
            f_eliminar_anticipo: async function() {
                var dataRes = null;
                var oModel = this.getView().getModel("myParam");
                var item = this.getView().byId("table_anticipo").getSelectedItem();
                 
                //validaciones para eliminación-----------
                if (!item) { 
                    sap.m.MessageBox.information("Debe seleccionar al menos 1 registro.");
                    return;
                } 
                else {
                    var objeto = item.getBindingContext("myParam").getObject();
    
                    //valida estado, solo puede eliminar si está en estado creado
                    if(objeto.EST_ORD != "C") {
                        sap.m.MessageBox.information("No puede realizar la acción, verifique el estado");
                        return;
                    }
                }
                //-----------------------------------------
     
                let ok = await this.MessageBoxPress('information', "Está seguro que quieres eliminar el registro?")
                if(ok) {
                    try {
                        const url = v_url_ini + "/postAnt.php"; 
                        
                        
                        if(ind_conecta_json_sap == "1") {
                          
                            let data = { 
                                METHOD: "D", 
                                ID_ORD: objeto.ID_ORD
                            }
                      
                            dataRes = await this.f_ajax('POST', url, data, oModel.getProperty("/token"));
                            
                            
                        } else { 
                           // dataRes = "Record deleted successfully";
                            
                        }
                        if(dataRes != undefined && dataRes[0] != undefined && dataRes[0].type != undefined && dataRes[0].type == "E") {
                            if(dataRes[0].MESSAGE == undefined){ MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor"); }
                            else { MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor (" + dataRes[0].MESSAGE + ")");  }
                            return;
                        } else { 
                             
                            //if(dataRes == "Record deleted successfully") { 
                                //MessageToast.show(`Anticipo borrado correctamente`);   
                                sap.m.MessageBox.information("Anticipo borrado correctamente");
                                this.f_get_det_sol_liq_ord();
                            //} else { 
                            //    MessageToast.show("Error en la respuesta del servidor, póngase en contacto con el proveedor"); 
                            //    return;
                            //}  
                        } 
                    } catch(error) {
                        if(error == undefined){ 
                            MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor");
                        }
                        else { 
                            if(error.descripcion != undefined) { MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor (" + error.descripcion + ")"); }
                            else if(error.message != undefined) { MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor (" + error.message + ")"); }
                            else { MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor"); }                            
                        }
                        return;
                    } 
                }
                
            }, 
            */
            onFileUploaderChange: function (oEvent) {
                var oModel = this.getView().getModel("myParam");
                var aFiles = oEvent.getParameter("files"); // Obtener los archivos seleccionados del evento
                oModel.setProperty("/fileBase64_selected", "");
                oModel.setProperty("/fileName_selected", "");

                if (aFiles && aFiles.length > 0) {
                    var oSelectedFile = aFiles[0]; // Acceder al primer archivo

                    var oReader = new FileReader();
                    oReader.onload = function (oEvent) {
                        var v_file_documento_base64 = oEvent.target.result; // Archivo en Base64
                        v_file_documento_base64 = v_file_documento_base64.split(",")[1];
                        //console.log("Archivo en Base64: ", v_file_documento_base64);
                        oModel.setProperty("/fileBase64_selected", v_file_documento_base64);
                        oModel.setProperty("/fileName_selected", aFiles[0].name);
                    };
                    oReader.readAsDataURL(oSelectedFile); // Convierte el archivo a base64
                } else {
                    console.log("No se ha seleccionado ningún archivo.");
                    oModel.setProperty("/fileBase64_selected", "");
                    oModel.setProperty("/fileName_selected", "");
                }
            },
            onSelectEstado: function (oEvent) {
                var item = oEvent.getSource().getSelectedItem();
                if (item !== null && item !== undefined && item !== "") {
                    this.f_get_lista_solicitud(item.getKey())
                }
            },
            f_change_comprobante_autocompletado: function () {
                var v_id_concepto = sap.ui.core.Fragment.byId('formNuevoLiquidacion', "cmb_concepto_gasto").getSelectedKey();
                var v_tip_comprobante = sap.ui.core.Fragment.byId('formNuevoLiquidacion', "cmb_tipo_comprobante").getSelectedKey();

                var regexConceptoGasto = /^6/;
                if (v_tip_comprobante === "00") {
                    sap.ui.core.Fragment.byId('formNuevoLiquidacion', "txt_ruc_nif_proveedor").setEnabled(false);
                    sap.ui.core.Fragment.byId('formNuevoLiquidacion', "txt_razon_social").setEnabled(false);
                } else {
                    sap.ui.core.Fragment.byId('formNuevoLiquidacion', "txt_ruc_nif_proveedor").setEnabled(true);
                    sap.ui.core.Fragment.byId('formNuevoLiquidacion', "txt_razon_social").setEnabled(true);
                }
            },
            evtCheckOI: function (evt) {
                var key = evt.getSource().getSelected();
                if (key) {
                    sap.ui.core.Fragment.byId('formNuevoLiquidacion', "idompotros").setEnabled(true);
                    sap.ui.core.Fragment.byId('formNuevoLiquidacion', "idompotros").setValue("");
                } else {
                   sap.ui.core.Fragment.byId('formNuevoLiquidacion', "idompotros").setEnabled(false);

                }
            },
            esFechaValida: function (fecha) {
                const date = new Date(fecha);
                return date instanceof Date && !isNaN(date);
            },
            f_reg_nuevo_detalle_liquidacion_tabla: async function () {
                var that = this;
                var oModel = this.getView().getModel("myParam");
                var detalleLiquidacion = oModel.getProperty("/detalleLiquidacion");

                var solicitud_orden = oModel.getProperty("/lista_ord_cab");
                var solicitud_selected_cab = oModel.getProperty("/solicitud_selected_cab/0");

                var btn_agregar_item_detalle = sap.ui.core.Fragment.byId('formNuevoLiquidacion', "btn_agregar_item_detalle");
                btn_agregar_item_detalle.setEnabled(false);

                if (!detalleLiquidacion) detalleLiquidacion = [];

                //valida información de gasto registrado en liquidación----------
                var v_fecha_liquidacion = sap.ui.core.Fragment.byId('formNuevoLiquidacion', "txt_fecha_liquidacion").getValue();
                var v_id_concepto = sap.ui.core.Fragment.byId('formNuevoLiquidacion', "cmb_concepto_gasto").getSelectedKey();
                var v_desc_gasto = sap.ui.core.Fragment.byId('formNuevoLiquidacion', "txt_descripcion_gasto").getValue();
                var v_fecha_gasto = sap.ui.core.Fragment.byId('formNuevoLiquidacion', "txt_fecha_gasto").getValue();

                var v_nif_prov = sap.ui.core.Fragment.byId('formNuevoLiquidacion', "txt_ruc_nif_proveedor").getValue();
                var v_nif_provEditabled = sap.ui.core.Fragment.byId('formNuevoLiquidacion', "txt_ruc_nif_proveedor").getEditable();

                var v_razon_social = sap.ui.core.Fragment.byId('formNuevoLiquidacion', "txt_razon_social").getValue();
                var v_razon_socialEditabled = sap.ui.core.Fragment.byId('formNuevoLiquidacion', "txt_razon_social").getEditable();

                var v_tip_comprobante = sap.ui.core.Fragment.byId('formNuevoLiquidacion', "cmb_tipo_comprobante").getSelectedKey();
                var v_nro_comprobante = sap.ui.core.Fragment.byId('formNuevoLiquidacion', "txt_nro_comprobante").getValue();
                var v_importe_gasto = sap.ui.core.Fragment.byId('formNuevoLiquidacion', "txt_monto_gasto").getValue();
                var v_moneda_gasto = sap.ui.core.Fragment.byId('formNuevoLiquidacion', "cmb_moneda_gasto").getSelectedKey();// colcoar otros cargos

                var v_imp_otros = sap.ui.core.Fragment.byId('formNuevoLiquidacion', "idompotros").getValue();//GM-17122025
                var v_id_otros = sap.ui.core.Fragment.byId('formNuevoLiquidacion', "idompotroscheck").getSelected();//GM-17122025
                v_id_otros = v_id_otros ? 'X' : '';

                var v_iva = sap.ui.core.Fragment.byId('formNuevoLiquidacion', "cmb_iva").getSelectedKey();
                var v_ivaEditabled = sap.ui.core.Fragment.byId('formNuevoLiquidacion', "cmb_iva").getEditable();

                var v_ceco = sap.ui.core.Fragment.byId('formNuevoLiquidacion', "cmb_ceco").getSelectedKey();
                var v_cecoEditabled = sap.ui.core.Fragment.byId('formNuevoLiquidacion', "cmb_ceco").getEditable();

                var v_input_documento = sap.ui.core.Fragment.byId('formNuevoLiquidacion', "file_input_documento").getValue();

                //var regexNIF = /^[A-Z0-9]{11}$/;
                var regexNIF = /^(?:[A-Z0-9]{11}|[A-Z0-9]{8})$/;
                var regexComprobante = /^[A-Za-z0-9]{4}-[A-Za-z0-9]{8}$/;
                var regexMontoGasto = /^\d+(\.\d{1,2})?$/;
                var regexRD = /^[rD]/;
                var regexConceptoGasto = /^6/;

                this.g_validar_importe = 0; //MM-20250804-AJ
                //if (v_tip_comprobante === "01") { //MM-20250804-AJ
                    if (parseFloat(v_importe_gasto) >= 700) {
                        this.g_validar_importe = 1;
                        sap.m.MessageBox.information("Por favor, El importe de gasto no debe superar a 700");
                        btn_agregar_item_detalle.setEnabled(true);
                        return;
                    }
                //}
                if (!v_input_documento) { //MM-20250804-AJ
                 
                        this.g_validar_importe = 1;
                        sap.m.MessageBox.information("Por favor, Escoger un documento");
                        btn_agregar_item_detalle.setEnabled(true);
                        return;
                    
                }
                /* if (v_tip_comprobante === "01") { //MM-20250804-AJ
                    if (v_id_concepto === "6312") {
                        if (parseFloat(v_importe_gasto) >= 400) {
                            this.g_validar_importe = 1;
                            sap.m.MessageBox.information("Por favor, validar que el saldo del importe para facturas, correspondiente al concepto de gasto 'Transporte de carga', no exceda los S/. 400.");  
                            return;
                        }
                    } else {
                        if (parseFloat(v_importe_gasto) >= 700) {
                            this.g_validar_importe = 1;
                            sap.m.MessageBox.information("Por favor, validar que el saldo del importe para facturas no exceda los S/. 700.");  
                            return;
                        }
                    }
                } */

                if (v_tip_comprobante === "02" && parseFloat(v_importe_gasto) >= 1500) { //MM-20250804-AJ
                    this.g_validar_importe = 1;
                    sap.m.MessageBox.information("Por favor, validar que el saldo del importe para recibos por honorarios no exceda los S/. 1500.");
                    return;
                }
                if (v_id_concepto === "6312" && parseFloat(v_importe_gasto) > 400) { //GM-20251217
                    this.g_validar_importe = 1;
                    sap.m.MessageBox.information("Por favor, Para el concepto de gasto indicado el importe no debe superar a 400.");
                    return;
                }

                /*if(solicitud_selected_cab.TIP_SOL === "ERE" && solicitud_orden.length > 0) { 
                    if (parseInt(solicitud_orden[0].IMP_ORD) !== parseInt(v_importe_gasto)) { 
                        sap.m.MessageBox.information("Por favor, valide el saldo del importe tiene que ser igual al anticipo"); 
                        return;
                    }
                } */
                if (solicitud_selected_cab.TIP_SOL === "CCH" && solicitud_orden.length > 0) {
                    const total = solicitud_orden.reduce((sum, item) => sum + parseFloat(item.IMP_ORD || 0), 0);
                    if (parseInt(v_importe_gasto) > parseInt(total)) {
                        sap.m.MessageBox.information("Por favor, valide el saldo del importe este no puede ser mayor a la suma de anticipos");
                        btn_agregar_item_detalle.setEnabled(true);
                        return;
                    }
                }
                //if (!regexRD.test(v_id_concepto) && regexConceptoGasto.test(v_id_concepto)) { 
                //if (!(v_id_concepto === "6999") && regexConceptoGasto.test(v_id_concepto)) { 
                // AQUI ERROR
                if (!(v_tip_comprobante === "00")) {
                    var array_comprobante = v_nro_comprobante.split('-');
                    if (array_comprobante.length === 2) {
                        var v_nro_comprobante_serie = `${array_comprobante[0].toString().trim().padStart(4, '0')}`.toUpperCase()
                        var v_nro_comprobante_nro = `${array_comprobante[1].toString().trim().padStart(8, '0')}`.toUpperCase()
                        v_nro_comprobante = `${v_nro_comprobante_serie}-${v_nro_comprobante_nro}`;
                        //console.log("v_nro_comprobante", v_nro_comprobante);
                        if (!regexComprobante.test(v_nro_comprobante)) {
                            sap.m.MessageBox.information("Por favor, valide el formato del nro comprobante");
                            btn_agregar_item_detalle.setEnabled(true);
                            return;
                        }

                        if (isNaN(v_nro_comprobante_nro)) {
                            sap.m.MessageBox.information("Por favor, valide el formato del nro comprobante, debe ser numérico");
                            btn_agregar_item_detalle.setEnabled(true);
                            return;
                        }

                    } else {
                        sap.m.MessageBox.information("Por favor, valide el formato del nro comprobante");
                        btn_agregar_item_detalle.setEnabled(true);
                        return;
                    }
                }
                if (v_fecha_liquidacion == undefined || v_fecha_liquidacion == "") {
                    sap.m.MessageBox.information("Por favor, valide la fecha de liquidación");
                    btn_agregar_item_detalle.setEnabled(true);
                    return;
                }
                if (v_id_concepto == undefined || v_id_concepto == "") {
                    sap.m.MessageBox.information("Por favor, valide el concepto de gasto");
                    btn_agregar_item_detalle.setEnabled(true);
                    return;
                }
                // se cambio el id_concepto por el tipo de comprobante 00

                if (v_tip_comprobante !== "00" && v_tip_comprobante !== "98" && v_tip_comprobante !== "99") {//gm 17122025

                    if ((v_nif_prov == undefined || v_nif_prov == "" || regexNIF.test(v_nif_prov) == false) && v_nif_provEditabled == true) {
                        sap.m.MessageBox.information("Por favor, valide la identificación del proveedor");
                        btn_agregar_item_detalle.setEnabled(true);
                        return;
                    }
                    if ((v_razon_social == undefined || v_razon_social == "") && v_razon_socialEditabled == true) {
                        sap.m.MessageBox.information("Por favor, valide la razón social del proveedor");
                        btn_agregar_item_detalle.setEnabled(true);
                        return;
                    }
                    if(v_id_concepto !== "R001" && v_id_concepto !== "D001" ){
                        if ((v_iva == undefined || v_iva == "") && v_ivaEditabled == true) {
                            sap.m.MessageBox.information("Por favor, valide el indicador de impuesto");
                            btn_agregar_item_detalle.setEnabled(true);
                            return;
                        }

                        if ((v_ceco == undefined || v_ceco == "") && v_cecoEditabled == true) {
                            sap.m.MessageBox.information("Por favor, valide el CECO");
                            btn_agregar_item_detalle.setEnabled(true);
                            return;
                        }
                    }


                }
                if (v_desc_gasto == undefined || v_desc_gasto == "") {
                    sap.m.MessageBox.information("Por favor, valide la descripción de gasto");
                    btn_agregar_item_detalle.setEnabled(true);
                    return;
                }
                if ((v_tip_comprobante === "00" && v_iva !== "C0") && v_ivaEditabled == true) {
                    sap.m.MessageBox.information("Para tipo 00 solo se permite Ind. IGV 0%");
                    btn_agregar_item_detalle.setEnabled(true);
                    return;
                }
                if (v_fecha_gasto == undefined || v_fecha_gasto == "") {
                    sap.m.MessageBox.information("Por favor, valide la fecha de gasto");
                    btn_agregar_item_detalle.setEnabled(true);
                    return;
                }


                var _v_fecha_gasto = ""
                if (v_fecha_gasto && v_fecha_gasto.split("-")[2]) {
                    let FEC_COMPROBANTE = v_fecha_gasto.split("-")
                    if (FEC_COMPROBANTE[0].length === 4) {
                        _v_fecha_gasto = `${FEC_COMPROBANTE[0]}-${FEC_COMPROBANTE[1]}-${FEC_COMPROBANTE[2]}`
                    } else {
                        _v_fecha_gasto = `${FEC_COMPROBANTE[2]}-${FEC_COMPROBANTE[1]}-${FEC_COMPROBANTE[0]}`
                    }
                } else if (v_fecha_gasto && v_fecha_gasto.split("/")[2]) {
                    let FEC_COMPROBANTE = v_fecha_gasto.split("/")
                    if (FEC_COMPROBANTE[0].length === 4) {
                        _v_fecha_gasto = `${FEC_COMPROBANTE[0]}-${FEC_COMPROBANTE[1]}-${FEC_COMPROBANTE[2]}`
                    } else {
                        _v_fecha_gasto = `${FEC_COMPROBANTE[2]}-${FEC_COMPROBANTE[1]}-${FEC_COMPROBANTE[0]}`
                    }
                } else {
                    _v_fecha_gasto = v_fecha_gasto;
                }
                let regexFormatoFecha = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/

                if (!regexFormatoFecha.test(_v_fecha_gasto)) {
                    console.log("v_fecha_gasto", _v_fecha_gasto)
                    sap.m.MessageBox.information("Por favor, ingrese una fecha valida");
                    btn_agregar_item_detalle.setEnabled(true);
                    return;
                }

                var oInputDate = new Date(_v_fecha_gasto.split("-")[0], _v_fecha_gasto.split("-")[1] - 1, _v_fecha_gasto.split("-")[2]); // Convertir a objeto Date
                var oCurrentDate = new Date();
                oCurrentDate.setHours(0, 0, 0, 0); // Asegurar la comparación solo con la fecha
                //console.log('oInputDate', oInputDate); 
                //console.log('oCurrentDate', oCurrentDate);
                if (oInputDate > oCurrentDate) {
                    sap.m.MessageBox.information("Fecha ingresada es posterior al dia de hoy");
                    btn_agregar_item_detalle.setEnabled(true);
                    return;
                }

                if (v_tip_comprobante == undefined || v_tip_comprobante == "") {
                    sap.m.MessageBox.information("Por favor, valide el tipo de comprobante");
                    btn_agregar_item_detalle.setEnabled(true);
                    return;
                }
                //if (v_tip_comprobante !== "00") {
                if (v_nro_comprobante == undefined || v_nro_comprobante == "") {
                    sap.m.MessageBox.information("Por favor, valide el nro de comprobante");
                    btn_agregar_item_detalle.setEnabled(true);
                    return;
                }
                //}


                if (v_importe_gasto == undefined || v_importe_gasto == "") {
                    sap.m.MessageBox.information("Por favor, valide el importe");
                    btn_agregar_item_detalle.setEnabled(true);
                    return;
                }
                if (v_moneda_gasto == undefined || v_moneda_gasto == "") {
                    sap.m.MessageBox.information("Por favor, valide la moneda");
                    btn_agregar_item_detalle.setEnabled(true);
                    return;
                }
                if (!regexMontoGasto.test(v_importe_gasto)) {
                    sap.m.MessageBox.information("Por favor, valide la importe este puede tener hasta 2 decimales");
                    btn_agregar_item_detalle.setEnabled(true);
                    return;
                }
                //----------------------------------------------------

                var v_file_documento_base64 = oModel.getProperty("/fileBase64_selected"); // Archivo en Base64
                if (v_file_documento_base64 == undefined) { v_file_documento_base64 = ""; }
                console.log("Archivo en Base64: ", v_file_documento_base64);

                var v_fileName_selected = oModel.getProperty("/fileName_selected"); // Nombre del archivo con extencion.
                if (v_fileName_selected == undefined) { v_fileName_selected = ""; }
                console.log("Archivo Name: ", v_fileName_selected);

                var v_visible_adj;
                if (v_file_documento_base64 == "" || v_fileName_selected == "") {
                    v_visible_adj = false;
                }
                else {
                    v_visible_adj = true;
                }

                /* if (v_fileName_selected.trim() === "") { //MM-20250804-AJ
                    sap.m.MessageBox.information("Por favor, adjuntar el documento correspondiente.");
                    btn_agregar_item_detalle.setEnabled(true); 
                    return;
                } */

                // Añade los datos una vez que el archivo base64 esté disponible
                var data = {
                    FEC_LIQ: v_fecha_liquidacion,
                    //FEC_GTO: this.f_format_h_fecha(v_fecha_gasto, '-'),
                    FEC_GTO: v_fecha_gasto,
                    ID_CONCEPTO: v_id_concepto,
                    NIF_PROV: v_nif_prov,
                    RAZ_PROV: v_razon_social,
                    TIP_COMP: v_tip_comprobante,
                    NRO_COMP: v_nro_comprobante.trim(),
                    MON_GTO: v_moneda_gasto,
                    IMP_GTO: v_importe_gasto,
                    DESC_GTO: v_desc_gasto,
                    OBJ_CO: v_ceco,
                    PAIS_COMP: "PE",
                    IND_IVA: v_iva,
                    DESC_ADJ: v_fileName_selected,
                    RUTA_ADJ: "",
                    visible_ADJ: v_visible_adj,
                    B64: v_file_documento_base64, // Archivo base64
                    IMP_OTROS:v_imp_otros,
                    ID_OTROS:v_id_otros
                };

                var T_LIQ_DET = oModel.getProperty("/detalleLiquidacion");
                var validateDuplicate = false;
                //cambio de validacion de duplicados v_id_concepto a v_tip_comprobante
                if (v_tip_comprobante !== "00") {
                    validateDuplicate = (data) => {
                        return T_LIQ_DET.some(item => item.NIF_PROV === data.NIF_PROV && item.NRO_COMP === data.NRO_COMP);
                    };
                } else {
                    validateDuplicate = (data) => {
                        return T_LIQ_DET.some(item => item.NRO_COMP === data.NRO_COMP);
                    };
                }

                
                    if (!validateDuplicate(data)) {                        
                            this.f_onKeyUp_sunat(data)
                        
                    } else {
                        sap.m.MessageBox.information("Por favor, validar documento duplicado");
                        btn_agregar_item_detalle.setEnabled(true);
                        return;
                    }
                

            },
            f_limpiar_datos_fragment_liquidacion: function () {
                var oModel = this.getView().getModel("myParam");
                //sap.ui.core.Fragment.byId('formNuevoLiquidacion',"txt_fecha_liquidacion").setValue("");
                sap.ui.core.Fragment.byId('formNuevoLiquidacion', "cmb_concepto_gasto").setSelectedKey("");
                sap.ui.core.Fragment.byId('formNuevoLiquidacion', "txt_descripcion_gasto").setValue("");
                sap.ui.core.Fragment.byId('formNuevoLiquidacion', "txt_fecha_gasto").setValue("");
                sap.ui.core.Fragment.byId('formNuevoLiquidacion', "txt_ruc_nif_proveedor").setValue("");
                sap.ui.core.Fragment.byId('formNuevoLiquidacion', "txt_razon_social").setValue("");
                sap.ui.core.Fragment.byId('formNuevoLiquidacion', "cmb_tipo_comprobante").setSelectedKey("");
                sap.ui.core.Fragment.byId('formNuevoLiquidacion', "txt_nro_comprobante").setValue("");
                sap.ui.core.Fragment.byId('formNuevoLiquidacion', "txt_monto_gasto").setValue("");
                sap.ui.core.Fragment.byId('formNuevoLiquidacion', "cmb_moneda_gasto").setSelectedKey("");
                sap.ui.core.Fragment.byId('formNuevoLiquidacion', "cmb_iva").setSelectedKey("");
                sap.ui.core.Fragment.byId('formNuevoLiquidacion', "cmb_ceco").setSelectedKey("");
                sap.ui.core.Fragment.byId('formNuevoLiquidacion', "file_input_documento").setValue("");
                sap.ui.core.Fragment.byId('formNuevoLiquidacion', "idompotros").setValue("");
                
                oModel.setProperty("/fileBase64_selected", "");
                oModel.setProperty("/fileName_selected", "");
            },
            f_change_concepto_gasto: function (oEvent) { //GG-20251712
                console.log(oEvent)
                var v_id_concepto = sap.ui.core.Fragment.byId('formNuevoLiquidacion', "cmb_concepto_gasto").getSelectedKey();
                if(v_id_concepto[0]=="D"){
                    sap.ui.core.Fragment.byId('formNuevoLiquidacion', "txt_ruc_nif_proveedor").setEditable(false);
                    sap.ui.core.Fragment.byId('formNuevoLiquidacion', "txt_razon_social").setEditable(false);
                    sap.ui.core.Fragment.byId('formNuevoLiquidacion', "cmb_iva").setEditable(false);
                    sap.ui.core.Fragment.byId('formNuevoLiquidacion', "cmb_ceco").setEditable(false);       
                    sap.ui.core.Fragment.byId('formNuevoLiquidacion', "cmb_tipo_comprobante").setSelectedKey("97");      
                }else{
                    sap.ui.core.Fragment.byId('formNuevoLiquidacion', "txt_ruc_nif_proveedor").setEditable(true);
                    sap.ui.core.Fragment.byId('formNuevoLiquidacion', "txt_razon_social").setEditable(true);
                    sap.ui.core.Fragment.byId('formNuevoLiquidacion', "cmb_iva").setEditable(true);
                    sap.ui.core.Fragment.byId('formNuevoLiquidacion', "cmb_ceco").setEditable(true);     
                                    
                }

           

            },
            f_change_ruc_liveupdate_form_liquidacion: async function (oEvent) {
                var v_ruc_nif = "";
                var v_razon_social = "";
                console.log(oEvent);

                if (oEvent != undefined && oEvent.mParameters != undefined && oEvent.mParameters.newValue != undefined && oEvent.mParameters.newValue != "") {
                    v_ruc_nif = oEvent.mParameters.newValue;
                    console.log("v_ruc_nif");
                    console.log(v_ruc_nif);
                    v_razon_social = await this.f_get_razon_social(v_ruc_nif);
                    sap.ui.core.Fragment.byId('formNuevoLiquidacion', "txt_razon_social").setValue(v_razon_social);
                    sap.ui.core.Fragment.byId('formNuevoLiquidacion', "txt_ruc_nif_proveedor").setValue(v_ruc_nif);
                }
            },
            f_live_change_monto_gasto_form_liquidacion: function () { //MM-20250804-AJ
                if (this.g_validar_importe === 1) {
                    var btn_agregar_item_detalle = sap.ui.core.Fragment.byId('formNuevoLiquidacion', "btn_agregar_item_detalle");
                    btn_agregar_item_detalle.setEnabled(true);
                }
            },
            f_get_razon_social: async function (p_ruc) {
                var dataRes = null;
                var oModel = this.getView().getModel("myParam");
                var v_url = "";
                var v_raz_soc = "";

                try {
                    v_url = v_url_ini + `/getRazSoc.php?RUC=${p_ruc}`;
                    if (ind_conecta_json_sap == "1") {
                        dataRes = await this.f_ajax('GET', v_url, '', oModel.getProperty("/token"));
                        dataRes = JSON.parse(dataRes)
                    }
                    else {
                        dataRes = { "RAZ_SOC": "RIVERCON. COM S.A.C" };
                    }

                    if (dataRes != undefined && dataRes[0] != undefined && dataRes[0].type != undefined && dataRes[0].type == "E") {
                        if (dataRes[0].MESSAGE == undefined) { MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor"); }
                        else { MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor (" + dataRes[0].MESSAGE + ")"); }
                        return;
                    } else {
                        if (dataRes != "") {
                            v_raz_soc = dataRes.RAZ_SOC;
                        }
                        else {
                            v_raz_soc = "";
                        }
                    }

                    return v_raz_soc;
                } catch (error) {
                    console.log('error');
                    console.log(error);
                    return "";

                    //if(error == undefined){ 
                    //    MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor");
                    //}
                    //else { 
                    //    if(error.descripcion != undefined) { MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor (" + error.descripcion + ")"); }
                    //    else if(error.message != undefined) { MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor (" + error.message + ")"); }
                    //    else { MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor"); }                            
                    //}
                }
            },
            onScanQRCode: async function (oEvent) {
                var dataRes = oEvent.getParameter("text");
                try {
                    // RUC| TIPO DE DOCUMENTO | SERIE | NUMERO | MTO TOTAL IGV | MTO TOTAL DEL COMPROBANTE | FECHA DE EMISION | TIPO DE DOCUMENTO ADQUIRIENTE | NUMERO DE DOCUMENTO ADQUIRIENTE | VALOR RESUMEN VALOR DE FIRMA|
                    //20550372640|1|103-04-00955372|1.14|7.50|14/10/2024|RUC|20452614767|bSln5d2O1t6fB0P10xjTdg97R+o=
                    //20252796623|01|F005|1029|113.6|807.82|09-10-2024|6|20452614767
                    var res = dataRes.split("|");
                    console.log(res)
                    var tipodocumento = res[1].toString().padStart(2, '0');

                    var serie, numero, fecha;
                    if (res[2].includes("-")) {
                        var splitSerieNumero = res[2].split("-");
                        serie = splitSerieNumero[0].trim();
                        numero = splitSerieNumero.slice(1).join("-");
                        fecha = res[5];
                        res[5] = res[4];
                        res[6] = fecha;
                    } else {
                        serie = res[2].trim();
                        numero = res[3].trim();
                    }
                    var dateTimeString = res[6].trim();
                    var dateOnly = dateTimeString.split(" ")[0].trim();
                    /* var dateOnly =dateTimeString;
                     let FEC_COMP_ = ""
                     console.log("dateTimeString", dateOnly)
 
                     // Reorganizar para obtener el formato "dd/mm/yyyy" 
                     if(dateOnly.split("-")[0]) {
                         let FEC_COMPROBANTE = dateOnly.trim().split("-")
                         console.log("FEC_COMPROBANTE arriba", FEC_COMPROBANTE)
 
                         if (FEC_COMPROBANTE[0].length === 4) {
                             FEC_COMP_ = `${FEC_COMPROBANTE[2]}/${FEC_COMPROBANTE[1]}/${FEC_COMPROBANTE[0]}`
                         } else {
                             FEC_COMP_ = `${FEC_COMPROBANTE[0]}/${FEC_COMPROBANTE[1]}/${FEC_COMPROBANTE[2]}`
                         }
                     } else if(dateOnly.split("/")[0]){
                         let FEC_COMPROBANTE = dateOnly.trim().split("/")
                         console.log("FEC_COMPROBANTE abajo", FEC_COMPROBANTE)
                         if (FEC_COMPROBANTE[0].length === 4) {
                             FEC_COMP_ = `${FEC_COMPROBANTE[2]}/${FEC_COMPROBANTE[1]}/${FEC_COMPROBANTE[0]}` 
                         } else {
                             FEC_COMP_ = `${FEC_COMPROBANTE[0]}/${FEC_COMPROBANTE[1]}/${FEC_COMPROBANTE[2]}` 
                         }
                     } else { 
                         FEC_COMP_ = dateOnly;
                     }
                     console.log("FEC_COMP_", FEC_COMP_) */
                    if (res[0]) {
                        var v_razon_social = await this.f_get_razon_social(res[0]);
                        sap.ui.core.Fragment.byId('formNuevoLiquidacion', "txt_razon_social").setValue(v_razon_social.trim());
                        sap.ui.core.Fragment.byId('formNuevoLiquidacion', "txt_ruc_nif_proveedor").setValue(res[0].trim());
                        sap.ui.core.Fragment.byId('formNuevoLiquidacion', "cmb_tipo_comprobante").setSelectedKey(tipodocumento.trim());
                        sap.ui.core.Fragment.byId('formNuevoLiquidacion', "txt_nro_comprobante").setValue(serie.trim() + "-" + numero.trim());
                        sap.ui.core.Fragment.byId('formNuevoLiquidacion', "txt_monto_gasto").setValue(res[5].trim());
                        sap.ui.core.Fragment.byId('formNuevoLiquidacion', "txt_fecha_gasto").setValue(dateOnly.trim());
                    }

                } catch (error) {
                    if (error == undefined) {
                        MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor");
                    }
                    else {
                        if (error.descripcion != undefined) { MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor (" + error.descripcion + ")"); }
                        else if (error.message != undefined) { MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor (" + error.message + ")"); }
                        else { MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor"); }
                    }
                    return;
                }
            },
            onScanIACode: async function (imageBase64) {
                let dataRes = null;
                //let resultado = null;
                try {
                    //const url = "http://ec2-3-94-103-186.compute-1.amazonaws.com:9000/getData"
                    //const url = "https://ec2-3-94-103-186.compute-1.amazonaws.com/getData"
                    const url = "https://107.22.4.177/getData"
                    if (ind_conecta_json_sap === "1") {

                        const data = {
                            "method": "IA",
                            "img": `${imageBase64}`
                            ///"img": "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a+Ch8dcWLE5g4BpmM3Ml6XLh2uYCXm4Dp7MgSs7Qeu8oxmySLheubS7g5TZwOgui5Ayt945izCbpcuHa5gJebgOnsyBKztB67yjGbJIuF65tLuDlNnA6C6LkDK33jmLMJuly4drmAl5uA6ezIErO0HrvKMZski4Xrm0u4OU2cDoLouQMrfeOYswm6XLh2uYCXm4Dp7MgSs7Qeu8oxmySLheubS7g5TZwOgui5Ayt945izCbpcuHa5gJebgOnsyBKztB67yjGbJIuF65tLuDlNnA6C6LkDK33jmLMJuly4drmAl5uA6ezIErO0HrvKMZski4Xrm0u4OU2cDoLouQMrfeOYswm6XLh2uYCXm4Dp7MgSs7Qeu8oxmySLheubS7g5TZwOgui5Ayt945izCbpcuHa5gJebgOnsyBKztB67yjGbJIuF65tLuDlNnA6C6LkDK33jmLMJuly4drmAl5uA6ezIErO0HrvKMZski4Xrm0u4OU2cDoLouQMrfeOYswm6XLh2uYCXm4Dp7MgSs7Qeu8oxmySLheubS7g5TZwOgui5Ayt945izCbpcuHa5gJeboML5rzK7G/8DUy+uF+Chmtcf8mTp+76bij/w3O9ty+sbBbK12UVbzfXJ8weUu8zvvrtSv1t3yOfTSchX8kxj8cVpUtD6+09P4U3QdksWu8HvMps6+09P4U3QdksWu8HvMps6+09P4U3QdksWu8HvMps6+09P4U3QdksWu8HvMps6+09P4U3QdksWu8HvMps6+09P4U3QdksWu8HvMps6+09P4U3QdksWu8HvMps6+09P4U3QdksWu8HvMps6+09P4U3QdksWu8HvMps6+09P4U3QdksWu8HvMps6+09P4U3QdksWu8HvMps6+09P4U3QdksWu8HvMps6+09P4U3QdksWu8HvMps6+09P4U3QdksWu8HvMps6+09P4U3QdksWu8HvMps6+09P4U3QdksWu8HvMps6+09P4U3QdksWu8HvMps6+09P4U3QdksWu8HvMps6+09P4U3QdksWu8HvMps6+09P4U3QdksWu8HvMrsF9bLGWZx/V3WWQ1KZlyv8j1SruF6ln/DdcEfNGn4EsqsApeG2W+BJyBBL//yOH/NdSUJX0q/4eUilFkFLg2t9w69rfcqDRIvF6HMKnBpaL136G29V2mQeLkIZVaBS0PrvUNv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"
                        }
                        dataRes = await this.f_ajax_aws('POST', url, data, '');
                        if (dataRes != undefined) {
                            dataRes = dataRes;
                        } else {
                            MessageToast.show("Error en la respuesta del servidor, póngase en contacto con el proveedor");
                            return;
                        }
                    } else {
                        dataRes = [
                            {
                                "RUC": ["20101087647"],
                                "FECHA": ["09/08/2024"],
                                "TIPO": "03",
                                "SERIE": "B3B8",
                                "NUMERO": "00298920",
                                "IMPORTE": "40.20"
                            }
                        ];

                    }
                    if (dataRes != undefined && dataRes[0] != undefined && dataRes[0].type != undefined && dataRes[0].type == "E") {
                        if (dataRes[0].MESSAGE == undefined) { MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor"); }
                        else { MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor (" + dataRes[0].MESSAGE + ")"); }
                        return;
                    } else {

                        return dataRes;
                    }
                } catch (error) {
                    if (error == undefined) {
                        MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor");
                    }
                    else {
                        if (error.descripcion != undefined) { MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor (" + error.descripcion + ")"); }
                        else if (error.message != undefined) { MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor (" + error.message + ")"); }
                        else { MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor"); }
                    }
                    return;
                }

            },
            f_capturar_pic_imagen: function () {
                var that = this;
                //if(this.cameraDialog==undefined){
                this.cameraDialog = new Dialog({
                    title: "Click en Capturar para tomar la foto",
                    beginButton: new Button({
                        text: "Capturar",
                        press: function (oEvent) {
                            that.imageValue = document.getElementById("player");
                            //var oButton = oEvent.getSource();
                            //that.imageText = oButton.getParent().getContent()[1].getValue();
                            that.cameraDialog.close();
                            that.cameraDialog.destroy();
                        }
                    }),
                    content: [new sap.ui.core.HTML({ content: "<video id='player' autoplay></video>" })],
                    endButton: new Button({
                        text: "Cancelar",
                        press: function () { that.cameraDialog.close(); }
                    })

                });
                this.getView().addDependent(this.cameraDialog);
                this.cameraDialog.open();
                this.cameraDialog.attachBeforeClose(this.setImage, this);
                var handleSuccesss = function (stream) {
                    player.srcObject = stream;
                }
                if (navigator.mediaDevices) {
                    navigator.mediaDevices.getUserMedia({ video: true }).then(handleSuccesss);
                }
                //} 	
            },
            setImage: function () {
                var that = this;
                var oVBox = sap.ui.core.Fragment.byId('formNuevoLiquidacion', "vBox1");
                var oItems = oVBox.getItems();
                var imageId = 'archie-' + oItems.length;
                var imageValue = this.imageValue;
                if (imageValue == null) {
                    MessageToast.show("No se ha capturado la imagen");
                } else {
                    var oCanvas = new sap.ui.core.HTML({ content: "<canvas id='" + imageId + "' width='320px' height='320px' style='2px solid red'></canvas>" });
                    var snapShotCanvas;
                    oVBox.addItem(oCanvas);
                    oCanvas.addEventDelegate({
                        onAfterRendering: async function () {
                            snapShotCanvas = document.getElementById(imageId);
                            var oContext = snapShotCanvas.getContext('2d');
                            oContext.drawImage(imageValue, 0, 0, snapShotCanvas.width, snapShotCanvas.height);
                            var imageData = snapShotCanvas.toDataURL('image/jpeg');
                            var imageBase64 = imageData.substring(imageData.indexOf(",") + 1);
                            console.log("imageBase64", imageBase64);
                            var data = await that.onScanIACode(imageBase64);
                            if (data) {
                                //let canva = document.getElementById("archie-0"); 
                                //canva.remove(); 
                                let canva = document.getElementById(`${imageId}`);
                                canva.remove();
                                var res = data.DATA.split("|")
                                console.log("DATA", res)

                                if (res.FECHA[0].trim()) {
                                    sap.ui.core.Fragment.byId('formNuevoLiquidacion', "txt_fecha_gasto").setValue(res.FECHA[0].trim());
                                }
                                if (res.RUC[0].trim()) {
                                    sap.ui.core.Fragment.byId('formNuevoLiquidacion', "txt_ruc_nif_proveedor").setValue(res.RUC[0].trim());
                                }
                                if (res.TIPO.trim()) {
                                    sap.ui.core.Fragment.byId('formNuevoLiquidacion', "cmb_tipo_comprobante").setSelectedKey(res.TIPO.trim());
                                }
                                if (res.SERIE.trim() && res.NUMERO.trim()) {
                                    sap.ui.core.Fragment.byId('formNuevoLiquidacion', "txt_nro_comprobante").setValue(res.SERIE.trim() + "-" + res.NUMERO.trim());
                                }
                                if (res.IMPORTE.trim()) {
                                    sap.ui.core.Fragment.byId('formNuevoLiquidacion', "txt_monto_gasto").setValue(res.IMPORTE.trim());
                                }
                                //sap.ui.core.Fragment.byId('formNuevoLiquidacion',"txt_descripcion_gasto");  
                                //sap.ui.core.Fragment.byId('formNuevoLiquidacion',"cmb_moneda_gasto");
                                //sap.ui.core.Fragment.byId('formNuevoLiquidacion',"inputArea"); 
                            } else {
                                //let canva = document.getElementById("archie-0"); 
                                //canva.remove(); 
                                let canva = document.getElementById(`${imageId}`);
                                canva.remove();
                            }


                        }
                    });

                }
            },

            onErrorMessageDialogPress: function (s_mensaje) { //MM-20250804-AJ
                if (!this.oErrorMessageDialog) {
                    this.oErrorMessageDialog = new sap.m.Dialog({
                        type: "Message",
                        title: "Error",
                        state: "Error",
                        content: new sap.m.Text({ text: s_mensaje }),
                        beginButton: new sap.m.Button({
                            type: "Emphasized",
                            text: "OK",
                            press: function () {
                                this.oErrorMessageDialog.close();
                            }.bind(this)
                        })
                    });
                }

                this.oErrorMessageDialog.open();
            },

            f_onKeyUp_sunat: async function (dataDetalleLiquidacion) {
                var oModel = this.getView().getModel("myParam");
                var concepto = sap.ui.core.Fragment.byId('formNuevoLiquidacion', "cmb_concepto_gasto").getSelectedKey();
                var that = this;
                const url = v_url_ini + "/getValSUNAT.php";
                const v_url = v_url_ini + `/getValComp.php`;
                var dataValid = null;
                var dataRes = null;
                var detalleLiquidacion = oModel.getProperty("/detalleLiquidacion");

                var FEC_COMP = sap.ui.core.Fragment.byId('formNuevoLiquidacion', "txt_fecha_gasto").getValue();
                var NIF_PROV = sap.ui.core.Fragment.byId('formNuevoLiquidacion', "txt_ruc_nif_proveedor").getValue();
                var TIPO = sap.ui.core.Fragment.byId('formNuevoLiquidacion', "cmb_tipo_comprobante").getSelectedKey();
                var COMPROBANTE = sap.ui.core.Fragment.byId('formNuevoLiquidacion', "txt_nro_comprobante").getValue();
                var IMP_COMP = sap.ui.core.Fragment.byId('formNuevoLiquidacion', "txt_monto_gasto").getValue();

                var btn_agregar_item_detalle = sap.ui.core.Fragment.byId('formNuevoLiquidacion', "btn_agregar_item_detalle");
                //btn_agregar_item_detalle.setEnabled(false); gm17122025
                //
                var regexConceptoGasto = /^6/;
                var regexComprobante = /^[A-Za-z0-9]{4}-[A-Za-z0-9]{8}$/;
                var regexRD = /^[rD]/;

                var v_id_concepto = sap.ui.core.Fragment.byId('formNuevoLiquidacion', "cmb_concepto_gasto").getSelectedKey();
                // SE CAMBIA v_id_concepto por el tipo_comprobante
                //if (!(v_id_concepto === "6999") && regexConceptoGasto.test(v_id_concepto)) {  
                if (!(TIPO === "00")) {

                    var array_comprobante = COMPROBANTE.split('-')
                    if (array_comprobante.length === 2) {
                        var v_nro_comprobante_serie = `${array_comprobante[0].toString().trim().padStart(4, '0')}`.toUpperCase()
                        var v_nro_comprobante_nro = `${array_comprobante[1].toString().trim().padStart(8, '0')}`.toUpperCase()
                        COMPROBANTE = `${v_nro_comprobante_serie}-${v_nro_comprobante_nro}`;
                        if (!regexComprobante.test(COMPROBANTE)) {
                            sap.m.MessageBox.information("Por favor, valide el formato del nro comprobante");
                            btn_agregar_item_detalle.setEnabled(true);
                            return;
                        } else {
                            sap.ui.core.Fragment.byId('formNuevoLiquidacion', "txt_nro_comprobante").setValue(COMPROBANTE);
                        }
                    } else {
                        sap.m.MessageBox.information("Por favor, valide el formato del nro comprobante");
                        btn_agregar_item_detalle.setEnabled(true);
                        return;
                    }
                }
                COMPROBANTE = sap.ui.core.Fragment.byId('formNuevoLiquidacion', "txt_nro_comprobante").getValue();

                var SERIE = COMPROBANTE.substring(0, 4)
                var NRO_COMPROBANTE = COMPROBANTE.substring(5, 16)
                let FEC_COMP_ = ""
                FEC_COMP = FEC_COMP.trim()
                if (FEC_COMP && FEC_COMP.split("-")[2]) {
                    let FEC_COMPROBANTE = FEC_COMP.split("-")
                    if (FEC_COMPROBANTE[0].length === 4) {
                        FEC_COMP_ = `${FEC_COMPROBANTE[2]}/${FEC_COMPROBANTE[1]}/${FEC_COMPROBANTE[0]}`
                    } else {
                        FEC_COMP_ = `${FEC_COMPROBANTE[0]}/${FEC_COMPROBANTE[1]}/${FEC_COMPROBANTE[2]}`
                    }
                } else if (FEC_COMP && FEC_COMP.split("/")[2]) {
                    let FEC_COMPROBANTE = FEC_COMP.split("/")
                    if (FEC_COMPROBANTE[0].length === 4) {
                        FEC_COMP_ = `${FEC_COMPROBANTE[2]}/${FEC_COMPROBANTE[1]}/${FEC_COMPROBANTE[0]}`
                    } else {
                        FEC_COMP_ = `${FEC_COMPROBANTE[0]}/${FEC_COMPROBANTE[1]}/${FEC_COMPROBANTE[2]}`
                    }
                } else {
                    FEC_COMP_ = FEC_COMP;
                }

                let data = {
                    //    "NIF_PROV": "20106076635",
                    "NIF_PROV": NIF_PROV,
                    "TIP_COMP": TIPO,
                    "SERIE": SERIE,
                    "NRO_COMP": NRO_COMPROBANTE,
                    "FEC_COMP": FEC_COMP_.trim(),
                    "IMP_COMP": IMP_COMP
                }

                let dataV = {
                    "NIF_PROV": NIF_PROV,
                    "NRO_COMP": `${SERIE}-${NRO_COMPROBANTE}`
                }

                var v_sociedad = oModel.getProperty("/empresa_seleccionada");
                var aData = oModel.getProperty("/listaGrupoActivacion");

                var OBJ_ACTIVACION = aData.find(function (oItem) {
                    return oItem.SOCIEDAD === v_sociedad;
                });

                try {
                    dataValid = await this.f_ajax('POST', v_url, dataV, oModel.getProperty("/token"));

                    //if(v_id_concepto !== "6999"){//GM
                    if (TIPO !== "00" && OBJ_ACTIVACION.EST_VAL === "X" & (TIPO == "01" || TIPO == "02")) {
                        //console.log("DATA", data)
                        if (ind_conecta_json_sap === "1") {
                            dataRes = await this.f_ajax('POST', url, data, oModel.getProperty("/token"));
                            //console.log("dataRes", dataRes); 
                            dataRes = JSON.parse(dataRes)

                            /* if (dataRes.data?.estadoCp === "0") { //MM-20250804-AJ
                                this.onErrorMessageDialogPress("Estado del comprobante: 'NO EXISTE' - (Comprobante no informado).");
                                btn_agregar_item_detalle.setEnabled(true); 
                                return;
                            }
    
                            if (dataRes.data?.estadoCp === "2") { //MM-20250804-AJ
                                this.onErrorMessageDialogPress("Estado del comprobante: 'ANULADO' - (Comunicado en una baja).");
                                btn_agregar_item_detalle.setEnabled(true); 
                                return;
                            }
    
                            if (dataRes.data?.estadoCp === "4") { //MM-20250804-AJ
                                this.onErrorMessageDialogPress("Estado del comprobante: 'NO AUTORIZADO' - (no autorizado por imprenta).");
                                btn_agregar_item_detalle.setEnabled(true); 
                                return;
                            } */

                            if (dataRes.success && (dataRes.data.estadoCp == "1" || dataRes.data.estadoCp == "3") && dataValid.trim() === "El comprobante aún no ha sido registrado.") { //MM-20250804-AJ
                                //if(dataValid === "El comprobante aún no ha sido registrado.") { 

                                let o_observaciones = dataRes.data?.observaciones;
                                let o_validar_observacion = 0;

                                if (o_observaciones !== undefined) {
                                    o_observaciones.forEach(reg => {
                                        if (reg === "- El comprobante de pago consultado ha sido emitido a otro contribuyente.") {
                                            o_validar_observacion++;
                                        }
                                    });
                                }

                                if (o_validar_observacion !== 0) {
                                    MessageToast.show("Razón social errada");
                                    btn_agregar_item_detalle.setEnabled(true);
                                    return;
                                }

                                MessageToast.show("Comprobante encontrado");
                                //console.log("AQUI")
                                let tipo_operacion = this.ogDialog.getTitle();

                                if (tipo_operacion === "Editar Detalle liquidacion gastos") {
                                    var aData = oModel.getProperty("/detalleLiquidacion");
                                    var iIndex = oModel.getProperty("/iIndex");

                                    aData[iIndex].ID_CONCEPTO = dataDetalleLiquidacion.ID_CONCEPTO;
                                    aData[iIndex].DESC_GTO = dataDetalleLiquidacion.DESC_GTO;
                                    aData[iIndex].FEC_GTO = dataDetalleLiquidacion.FEC_GTO;
                                    aData[iIndex].NIF_PROV = dataDetalleLiquidacion.NIF_PROV;
                                    aData[iIndex].RAZ_PROV = dataDetalleLiquidacion.RAZ_PROV;
                                    aData[iIndex].TIP_COMP = dataDetalleLiquidacion.TIP_COMP;
                                    aData[iIndex].NRO_COMP = dataDetalleLiquidacion.NRO_COMP;
                                    aData[iIndex].IMP_GTO = dataDetalleLiquidacion.IMP_GTO;
                                    aData[iIndex].MON_GTO = dataDetalleLiquidacion.MON_GTO;
                                    aData[iIndex].IND_IVA = dataDetalleLiquidacion.IND_IVA;
                                    aData[iIndex].OBJ_CO = dataDetalleLiquidacion.OBJ_CO;

                                    oModel.setProperty("/detalleLiquidacion", aData);

                                } else {
                                    detalleLiquidacion.push(dataDetalleLiquidacion);
                                    oModel.setProperty("/detalleLiquidacion", detalleLiquidacion);
                                }

                                that.f_limpiar_datos_fragment_liquidacion();
                                btn_agregar_item_detalle.setEnabled(true);
                                //setTimeout(async () => {
                                that.f_get_static_detalle_liquidacion();
                                //}, 1000)

                            } else if (dataValid.trim() === "El comprobante ya ha sido registrado.") {
                                MessageToast.show("El comprobante ya ha sido registrado.");
                                btn_agregar_item_detalle.setEnabled(true);
                                return;
                            } else {
                                MessageToast.show("Comprobante NO encontrado");
                                btn_agregar_item_detalle.setEnabled(true);
                                return;
                            }
                        } else {
                            btn_agregar_item_detalle.setEnabled(true);
                            MessageBox.information(`Comprobante encontrado`);
                        }

                    } else {
                        //console.log("AQUI")
                        if (dataValid.trim() === "El comprobante aún no ha sido registrado.") {
                            detalleLiquidacion.push(dataDetalleLiquidacion);
                            oModel.setProperty("/detalleLiquidacion", detalleLiquidacion);
                            that.f_limpiar_datos_fragment_liquidacion();
                            that.f_get_static_detalle_liquidacion();
                            btn_agregar_item_detalle.setEnabled(true);
                        } else {
                            MessageToast.show("El comprobante ya ha sido registrado.");
                            btn_agregar_item_detalle.setEnabled(true);
                            return;
                        }
                    }
                } catch (error) {
                    console.log("erro catch", error)

                    //if (error.descripcion_error.success) {
                    dataValid = error.descripcion_error.responseText;
                    if (dataValid.trim() === "El comprobante ya ha sido registrado.") {
                        MessageToast.show("El comprobante ya ha sido registrado.");
                        btn_agregar_item_detalle.setEnabled(true);

                    } else {

                        if (TIPO !== "00" && OBJ_ACTIVACION.EST_VAL === "X" & (TIPO == "01" || TIPO == "02")) {
                            //console.log("DATA", data) 
                            if (ind_conecta_json_sap === "1") {
                                dataRes = await this.f_ajax('POST', url, data, oModel.getProperty("/token"));
                                //console.log("dataRes", dataRes); 
                                dataRes = JSON.parse(dataRes)

                                /* if (dataRes.data?.estadoCp === "0") { //MM-20250804-AJ
                                    this.onErrorMessageDialogPress("Estado del comprobante: 'NO EXISTE' - (Comprobante no informado).");
                                    btn_agregar_item_detalle.setEnabled(true); 
                                    return;
                                }
        
                                if (dataRes.data?.estadoCp === "2") { //MM-20250804-AJ
                                    this.onErrorMessageDialogPress("Estado del comprobante: 'ANULADO' - (Comunicado en una baja).");
                                    btn_agregar_item_detalle.setEnabled(true); 
                                    return;
                                }
        
                                if (dataRes.data?.estadoCp === "4") { //MM-20250804-AJ
                                    this.onErrorMessageDialogPress("Estado del comprobante: 'NO AUTORIZADO' - (no autorizado por imprenta).");
                                    btn_agregar_item_detalle.setEnabled(true); 
                                    return;
                                } */

                                if (dataRes.success && (dataRes.data.estadoCp == "1" || dataRes.data.estadoCp == "3") && dataValid.trim() === "El comprobante aún no ha sido registrado.") { //MM-20250804-AJ

                                    //if(dataValid === "El comprobante aún no ha sido registrado.") {   
                                    MessageToast.show("Comprobante encontrado");
                                    //console.log("AQUI") 
                                    detalleLiquidacion.push(dataDetalleLiquidacion);
                                    oModel.setProperty("/detalleLiquidacion", detalleLiquidacion);
                                    that.f_limpiar_datos_fragment_liquidacion();
                                    //setTimeout(async () => {
                                    that.f_get_static_detalle_liquidacion();
                                    //}, 1000)  
                                    btn_agregar_item_detalle.setEnabled(true);

                                } else if (dataValid.trim() === "El comprobante ya ha sido registrado.") {
                                    MessageToast.show("El comprobante ya ha sido registrado.");
                                    btn_agregar_item_detalle.setEnabled(true);
                                    return;
                                } else {
                                    MessageToast.show("Comprobante NO encontrado");
                                    btn_agregar_item_detalle.setEnabled(true);
                                    return;
                                }
                            } else {
                                MessageBox.information(`Comprobante encontrado`);
                                btn_agregar_item_detalle.setEnabled(true);
                                return;
                            }

                        } else {
                            //console.log("AQUI")
                            if (dataValid.trim() === "El comprobante aún no ha sido registrado.") {
                                detalleLiquidacion.push(dataDetalleLiquidacion);
                                oModel.setProperty("/detalleLiquidacion", detalleLiquidacion);
                                that.f_limpiar_datos_fragment_liquidacion();
                                that.f_get_static_detalle_liquidacion();
                                btn_agregar_item_detalle.setEnabled(true);
                            } else {
                                MessageToast.show("El comprobante ya ha sido registrado.");
                                btn_agregar_item_detalle.setEnabled(true);
                                return;
                            }
                        }
                    }
                    //} else {
                    //    MessageToast.show(`${error.descripcion_error.message}`); 
                    // }


                    /*if(error == undefined){ 
                        MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor");
                    }
                    else { 
                        if(error.descripcion != undefined) { MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor (" + error.descripcion + ")"); }
                        else if(error.message != undefined) { MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor (" + error.message + ")"); }
                        else { MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor"); }                            
                    }  */
                    return;
                }
            }
        });
    });
