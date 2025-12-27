sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/util/Export",
    "sap/ui/core/util/ExportTypeCSV",
    "sap/ui/export/Spreadsheet",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/FilterType",
    "sap/ui/core/BusyIndicator",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/ui/core/format/DateFormat"
], function ( Controller, Export, ExportTypeCSV, Spreadsheet, MessageToast, MessageBox, Filter, FilterOperator, FilterType, BusyIndicator, JSONModel, Fragment, DateFormat) {
    "use strict";
    var ind_conecta_json_sap = 1;
    var v_url_ini = "/cpblcase";
    //var v_url_ini = "https://rivercon.com/RcomExpensesAIQAS"; 
    return Controller.extend("nsnew.uisemnew.controller.Vista_Administrador", {
        onInit: function () {
            this.getRouter().getRoute("Vista_Administrador").attachMatched(this._onRouteMatched, this);
        },
        _onRouteMatched: function () {
            this.f_get_datos_maestros();
            //this.f_get_usuarios()
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
                    oModel.setProperty("/token","E");
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
        onAfterRendering: function () {
            console.log('afterrendering llama routematched');
            this._onRouteMatched(); 
        },
        f_logout: function () {
            window.location.replace('./logout');
        },
        getRouter: function () { return sap.ui.core.UIComponent.getRouterFor(this); },
        f_press_volver: function () {
            this.getRouter().navTo("Vista_Menu_Principal");
        },
        MessageBoxPress: function (typeMsm,titleMsm) {
            return new Promise((resolve, reject) => {  
                sap.m.MessageBox[typeMsm](titleMsm, {
                    title: "Mensaje de confirmacion",
                    actions: [ sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL ],
                    emphasizedAction: sap.m.MessageBox.Action.OK,
                    onClose: function (sAction) {
                        let res = false
                        if(sAction == sap.m.MessageBox.Action.OK){  
                            res = true
                        }  
                        resolve(res); 
                    }
                });
            }); 
        },
        f_get_datos_maestros: async function() {
            var dataRes = null;
            var dataRes_Area = null;
            var dataRes_Concepto = null;
            var dataRes_Con_CTA = null;
            var dataRes_Obj_Co= null;
            var dataRes_Pais = null;
            var dataRes_Tip_Comp = null;
            var dataRes_Tip_Nota = null;
            var dataRes_T_Usr = null;
            var dataRes_T_Lib = null;
            var dataRes_T_Val = null;
            var urlAjax;
            
            var oModel = this.getView().getModel("myParam"); 
            var v_sociedad = oModel.getProperty("/empresa_seleccionada");
            
            try {
                //urlAjax = v_url_ini + "/getDM.php?USER=adlira&SOC="+ v_sociedad;
                urlAjax = `${v_url_ini}/getAdminData.php`
                console.log('urlAjax'); console.log(urlAjax);
                if(ind_conecta_json_sap === 1) {
                    BusyIndicator.show(0);
                    let data = "";
                    dataRes = await this.f_ajax('GET', urlAjax, data, oModel.getProperty("/token"));
                    BusyIndicator.hide();
                    dataRes = JSON.parse(dataRes);
                    //console.log('dataRes'); console.log(dataRes);    
                }
                else {
                    // Simulación de datos si no hay conexión
                    dataRes = {
                        "T_USR": [ { "SOCIEDAD": "1000", "ID_USR": "ADLIRA", "GPO_LIB": "01", "GPO_AUT": "GALL" } ],
                        "T_AREA":[{"AREA":"1000000001","DESC_AREA":"Log\u00edstica","OBJ_CO":"1001"},{"AREA":"1000000002","DESC_AREA":"Marketing","OBJ_CO":"1002"},
                        {"AREA":"1000000003","DESC_AREA":"Contabilidad","OBJ_CO":"1001"}],
                        "T_CONCEPTO":[{"ID_CONCEPTO":"6311","DES_CONCEPTO":"Transporte"},{"ID_CONCEPTO":"6312","DES_CONCEPTO":"Correos"},
                        {"ID_CONCEPTO":"6313","DES_CONCEPTO":"Alojamiento"},{"ID_CONCEPTO":"6314","DES_CONCEPTO":"Alimentaci\u00f3n"},
                        {"ID_CONCEPTO":"6315","DES_CONCEPTO":"Otros gastos de viaje"},{"ID_CONCEPTO":"6316","DES_CONCEPTO":"Gastos recreativos"}],
                        "T_OBJ_CO":[{"OBJ_CO":"1001","DESC_OBJ_CO":"CECO 1","TIPO_OBJ":null},{"OBJ_CO":"1002","DESC_OBJ_CO":"CECO 2","TIPO_OBJ":null}],
                        "T_PAIS":[{"ID_PAIS":"PE","DESC_PAIS":"Per\u00fa"}],
                        "T_TIP_NOTA":[{"ID_TIP_NOTA":"AP","DESC_TIP_NOTA":"Aprobaci\u00f3n"}, {"ID_TIP_NOTA":"RE","DESC_TIP_NOTA":"Rechazo"}],
                        "T_TIP_COMP":[{"PAIS":"PE","TIP_COMP":"01","DESC_COMP":"Factura"}, {"PAIS":"PE","TIP_COMP":"03","DESC_COMP":"Boleta"}],
                        "T_CON_CTA":[], 
                            "T_LIB": [
                        {
                            "SOCIEDAD": "1000",
                            "GPO_LIB": "01",
                            "TIPO": "L",
                            "USR_AP_N1": "ADLIRA",
                            "USR_AP_N2": "NLIRA"
                        },
                        {
                            "SOCIEDAD": "1000",
                            "GPO_LIB": "01",
                            "TIPO": "O",
                            "USR_AP_N1": "ADLIRA",
                            "USR_AP_N2": "NLIRA" }]
                    }
                }

                if(dataRes != undefined && dataRes[0] != undefined && dataRes[0].type != undefined && dataRes[0].type == "E") {
                    if(dataRes[0].MESSAGE == undefined){ MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor"); }
                    else { MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor (" + dataRes[0].MESSAGE + ")");  }
                    return;
                } 
                else {    
                    dataRes_Area = dataRes.T_AREA;
                    
                    dataRes_Concepto = dataRes.T_CONCEPTO;
                    //añade concepto vacio si no existiera----
                    var ind_existe_vacio = dataRes_Concepto.some(function(concepto) {
                        return concepto.ID_CONCEPTO == "";
                    });
                    if (!ind_existe_vacio) {
                        var obj_vacio = { "ID_CONCEPTO": "", "DES_CONCEPTO": ""  };
                       // dataRes_Concepto.push(obj_vacio);
                    }
                    //----------------------------------------

                    dataRes_Con_CTA = dataRes.T_CON_CTA;
                    dataRes_Obj_Co= dataRes.T_OBJ_CO;
                    dataRes_Pais = dataRes.T_PAIS;
                    dataRes_Tip_Comp = dataRes.T_TIP_COMP;
                    dataRes_Tip_Nota = dataRes.T_TIP_NOTA;
                    dataRes_T_Usr = dataRes.T_USR;
                    dataRes_T_Lib = dataRes.T_LIB;
                    dataRes_T_Val = dataRes.T_VALIDACION;;

                    
                    oModel.setProperty("/listaAreas", dataRes_Area);
                    oModel.setProperty("/listaConceptosPago", dataRes_Concepto);
                    oModel.setProperty("/listaConceptosGasto", dataRes_Concepto);
                    oModel.setProperty("/usuariosADM", dataRes_T_Usr);
 
                    oModel.setProperty("/listaCon_CTA", dataRes_Con_CTA);
                    oModel.setProperty("/listaObj_Co", dataRes_Obj_Co);
                    oModel.setProperty("/listaPais", dataRes_Pais); 
                    oModel.setProperty("/listaComprobantes", dataRes_Tip_Comp);
                    oModel.setProperty("/listaTip_Nota", dataRes_Tip_Nota);
                    oModel.setProperty("/listaGrupoLiberacion", dataRes_T_Lib);
                    oModel.setProperty("/listaGrupoActivacion", dataRes_T_Val);

                }  
            } catch(error) {
                BusyIndicator.hide(); 
                console.log(error);
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
        },
        f_get_concepto_pago: async function () {
            var dataRes = null;
            var urlAjax;
            var oModel = this.getView().getModel("myParam");
            try {
                urlAjax = v_url_ini + "/getConceptosPago.php"; // Ajusta la URL a tu endpoint
                if (ind_conecta_json_sap === 1) {
                    BusyIndicator.show(0);
                    let data = "";
                    dataRes = await this.f_ajax('GET', urlAjax, data, oModel.getProperty("/token"));
                    BusyIndicator.hide();
                    if (dataRes.ITAB != undefined) {
                        dataRes = dataRes.ITAB;
                    } else {
                        MessageToast.show("Error en la respuesta del servidor, póngase en contacto con el proveedor");
                        return;
                    }
                }
                else {
                    // Simulación de datos si no hay conexión
                    dataRes = [
                        { "ID_CONCEPTO": "P001", "DES_CONCEPTO": "Pago de servicios" },
                        { "ID_CONCEPTO": "P002", "DES_CONCEPTO": "Compra de materiales" },
                        { "ID_CONCEPTO": "P003", "DES_CONCEPTO": "Gastos de viaje" },
                        { "ID_CONCEPTO": "P004", "DES_CONCEPTO": "Alquiler de equipos" },
                        { "ID_CONCEPTO": "P005", "DES_CONCEPTO": "Consultoría" },
                        { "ID_CONCEPTO": "P006", "DES_CONCEPTO": "Marketing y publicidad" },
                        { "ID_CONCEPTO": "P007", "DES_CONCEPTO": "Capacitación" },
                        { "ID_CONCEPTO": "P008", "DES_CONCEPTO": "Mantenimiento" },
                        { "ID_CONCEPTO": "P009", "DES_CONCEPTO": "Impuestos y tasas" },
                        { "ID_CONCEPTO": "P010", "DES_CONCEPTO": "Seguros" }
                    ];
                }
        
                /*
                dataRes.forEach(function (item) {
                    item.ALIMENTO = item.ALIMENTO == "X";
                    item.GASTO_VEHIC = item.GASTO_VEHIC == "X";
                    item.GASTO_FLOTA = item.GASTO_FLOTA == "X";
                });
                */
        
                if (dataRes != undefined && dataRes[0] != undefined && dataRes[0].type != undefined && dataRes[0].type == "E") {
                    if (dataRes[0].MESSAGE == undefined) { MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor"); }
                    else { MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor (" + dataRes[0].MESSAGE + ")"); }
                    return;
                } else {
                    oModel.setProperty("/listaConceptosPago", dataRes);
                    return;
                }
            } catch (error) {
                BusyIndicator.hide();
                console.log(error);
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
        f_get_usuarios: async function() {
            var dataRes = null;
            var urlAjax;
            var oModel = this.getView().getModel("myParam");
            try {
                urlAjax = v_url_ini + "/getUsuarios.php"; // Ajusta la URL a tu endpoint
                if (ind_conecta_json_sap == 1) {
                    BusyIndicator.show(0);
                    let data = "";
                    dataRes = await this.f_ajax('GET', urlAjax, data, oModel.getProperty("/token"));
                    BusyIndicator.hide();
                    if (dataRes.ITAB != undefined) {
                        dataRes = dataRes.ITAB;
                    } else {
                        MessageToast.show("Error en la respuesta del servidor, póngase en contacto con el proveedor");
                        return;
                    }
                }
                else {
                    // Simulación de datos si no hay conexión
                    dataRes = [
                        { "ID_UC": 1, "USR_SAP": "0007000006", "ID_CENTRO": "1100101002 ", "PLACA": "GG001", "LIMITE": null, "RUC_EMP": null },
                        { "ID_UC": 2, "USR_SAP": "0007000005", "ID_CENTRO": "1100102004", "PLACA": "ABC-CDE", "LIMITE": null, "RUC_EMP": null },
                        { "ID_UC": 3, "USR_SAP": "0007000006", "ID_CENTRO": "1100101003",  "PLACA": "OG0103", "LIMITE": 101, "RUC_EMP": null } 
                    ];
                }
        
                
        
                if (dataRes != undefined && dataRes[0] != undefined && dataRes[0].type != undefined && dataRes[0].type == "E") {
                    if (dataRes[0].MESSAGE == undefined) { MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor"); }
                    else { MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor (" + dataRes[0].MESSAGE + ")"); }
                    return;
                } else {
                    oModel.setProperty("/usuariosADM", dataRes);
                    return;
                }
            } catch (error) {
                BusyIndicator.hide();
                console.log(error);
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
                    success: function(result) {
                        resolve(result);
                    },
                    error: function(error) {
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
                            if(error.status != undefined) {
                                if(error.status == "401"){
                                    sap.m.MessageBox.information("No autorizado para realizar la acción, por favor ingrese nuevamente con un usuario autorizado");
                                    that.f_logout();
                                    return;
                                }
                                else {                                
                                    //if(error.responseText != undefined && error.statusText != undefined) {str_error = "Mensaje " + error.status + " (" + error.responseText + " - " + error.statusText + ")";}
                                    //else if(error.responseText != undefined) {str_error = "Mensaje " + error.status + " (" + error.responseText + ")";} 
                                    //else 
                                    if(error.statusText != undefined) {str_error = "Mensaje " + error.status + " (" + error.statusText + ")";} 
                                    else {str_error = "Mensaje " + error.status}
                                }
                            }
                            else {
                                //if(error.responseText != undefined && error.statusText != undefined) {str_error = "Mensaje (" + error.responseText + " - " + error.statusText + ")";} 
                                //else if(error.responseText != undefined) {str_error = "Mensaje (" + error.responseText + ")";} 
                                //else 
                                if(error.statusText != undefined) {str_error = "Mensaje (" + error.statusText + ")";} 
                                else {str_error = "Mensaje"}
                            }
                        }
                        var errorObj = { cod: 'Error', descripcion: str_error };
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
        onPressCrearArea: function () {
            var oView = this.getView();
            var oAreaModel = new JSONModel({
                ID_AREA: "",
                DESC_AREA: "",
                OBJ_CO:""
            });
            oView.setModel(oAreaModel, "areaModel");

            if (!this.byId("dialogCrearArea")) {
                Fragment.load({
                    id: oView.getId(),
                    name: "nsnew.uisemnew.view.fragments.CrearArea", 
                    controller: this
                }).then(function (oDialog) {

                    oView.addDependent(oDialog);
                    oDialog.setTitle(`Crear Area`);  

                    oDialog.open();
                });
            } else {
                oAreaModel.setData({
                    ID_AREA: "",
                    DESC_AREA: "",
                    OBJ_CO: ""
                });
                this.byId("dialogCrearArea").open();
            }
        },
        onGuardarArea: function() {
            console.log("GUARDAR centro");
            var oView = this.getView();
            var oAreaModel = oView.getModel("areaModel");
            var sAreaID = oAreaModel.getProperty("/AREA");
            var sAreaDesc = oAreaModel.getProperty("/DESC_AREA");
            var sOBJ_CO = oAreaModel.getProperty("/OBJ_CO");
            
            if (!sAreaID || !sAreaDesc || !sOBJ_CO) {
                MessageToast.show("Por favor ingrese el ID, ceco y la descripción del área");
                return;
            }

            this.guardarArea(sAreaID, sAreaDesc, sOBJ_CO); 
            //this.byId("dialogCrearArea").close();
        },
        onFormArea: function() { 
            var oDialog = this.byId("dialogCrearArea");
            var sTitle = oDialog.getTitle();  
            if (sTitle === "Editar area") { 
                this.editarArea() 
            } else {
                this.onGuardarArea()
            }
        },
        guardarArea: function(areaID, areaDesc, sOBJ_CO) {
            var oModel = this.getView().getModel("myParam");
            var data = { 
                "METHOD": "C",
                "TABLA": "T_AREA",
                "AREA": areaID,
                "DESC_AREA": areaDesc,
                "OBJ_CO": sOBJ_CO
            };
            var urlAjax = v_url_ini + "/getAdminData.php"; 


            try {

                BusyIndicator.show(0);
                var that = this;
                if(ind_conecta_json_sap === 1) {
                    this.f_ajax('POST', urlAjax, data, oModel.getProperty("/token"))
                    .then(function (dataRes) {
                        BusyIndicator.hide();
                        //if (dataRes === "New record created successfully") {
                            MessageToast.show("Área creada exitosamente");
                            that.f_get_datos_maestros();
                            that.onCancelar('dialogCrearArea')
                        //} else {
                        //    MessageToast.show("Error al crear el area: " + dataRes.MESSAGE); 
                        //    that.onCancelar('dialogCrearArea')
                        //}
                    }.bind(this))
                    .catch(function (error) {
                        BusyIndicator.hide();
                        MessageToast.show("Error al crear el area: " + (error.descripcion || error.message || "Error desconocido"));
                    });
                } else { 
                    BusyIndicator.hide(); 
                    MessageToast.show("Area creado exitosamente");  
                    that.onCancelar('dialogCrearArea')
                }
            } catch(error) {
                BusyIndicator.hide(); 
                console.log(error);
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
        },
        onPressEditarArea: function(oEvent) {

            var oButton = oEvent.getSource(); 
            var oListItem = oButton.getParent().getParent();  
            var oBindingContext = oListItem.getBindingContext("myParam"); 
            var oData = oBindingContext.getObject(); 
            console.log("oData", oData);
            var oView = this.getView();
            var oAreaModel = new JSONModel({
                AREA: oData.AREA,
                DESC_AREA: oData.DESC_AREA,
                OBJ_CO: oData.OBJ_CO,
            });
            oView.setModel(oAreaModel, "areaModel");
            if (!this.byId("dialogCrearArea")) {
                Fragment.load({
                    id: oView.getId(),
                    name: "nsnew.uisemnew.view.fragments.CrearArea", 
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    oDialog.setTitle(`Editar area`);  

                    oDialog.open();
                });
            } else {
                oAreaModel.setData({
                    AREA: "",
                    DESC_AREA: "",
                    OBJ_CO: "" 
                });
                this.byId("dialogCrearArea").open();
            }
        },
        editarArea: function() {
            var oModel = this.getView().getModel("myParam");
                var oView = this.getView();
                var oComprobanteModel = oView.getModel("areaModel");
    
                var AREA = oComprobanteModel.getProperty("/AREA");
                var DESC_AREA = oComprobanteModel.getProperty("/DESC_AREA");  
                var OBJ_CO = oComprobanteModel.getProperty("/OBJ_CO");  
 
                    
                var data = { 
                    "METHOD": "U",
                    "TABLA": "T_AREA",
                    "AREA": AREA,
                    "DESC_AREA": DESC_AREA, 
                    "OBJ_CO": OBJ_CO
                };
     
                var urlAjax = v_url_ini + "/getAdminData.php"; 

                try {

                    BusyIndicator.show(0);
                    var that = this;
                    if(ind_conecta_json_sap === 1) {
                        this.f_ajax('POST', urlAjax, data, oModel.getProperty("/token"))
                        .then(function (dataRes) {
                            BusyIndicator.hide();
                            //if (dataRes ==="Record updated successfully") {
                                MessageToast.show("Centro actualizado exitosamente");
                                that.f_get_datos_maestros();
                                that.onCancelar('dialogCrearArea')
                            //} else {
                            //    MessageToast.show("Error al actualizar el centro: " + dataRes.MESSAGE);
                            //    that.onCancelar('dialogCrearArea') 
                            //}
                        }.bind(this))
                        .catch(function (error) {
                            BusyIndicator.hide();
                            MessageToast.show("Error al actualizar el centro: " + (error.descripcion || error.message || "Error desconocido"));
                        });
                    } else {
                        BusyIndicator.hide(); 
                        MessageToast.show("Centro actualizado exitosamente"); 
                        that.onCancelar('dialogCrearArea')
                    }
                } catch(error) {
                    BusyIndicator.hide(); 
                    console.log(error);
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
        }, 
        pressEliminarArea: async function(oEvent){
            var oModel = this.getView().getModel("myParam");

            var oButton = oEvent.getSource(); 
            var oListItem = oButton.getParent().getParent(); 
            var oBindingContext = oListItem.getBindingContext("myParam"); 
            var oData = oBindingContext.getObject(); 
            //console.log("oData", oData); 


            try {
                let ok = await this.MessageBoxPress('information', "Está seguro que quieres eliminar el registro?")
                if(ok) {
                    var urlAjax = v_url_ini + "/getAdminData.php";
                    var data = {
                        "METHOD": "D",
                        "TABLA": "T_AREA",
                        "AREA": oData.AREA
                    }
                    BusyIndicator.show(0);
                    var that = this;
                    if(ind_conecta_json_sap === 1) {
                        this.f_ajax('POST', urlAjax, data, oModel.getProperty("/token"))
                        .then(function (dataRes) {
                            BusyIndicator.hide();
                            //if (dataRes === "Record deleted successfully") {
                                MessageToast.show("Área eliminada exitosamente");
                                that.f_get_datos_maestros();  
                            //} else {  
                            //    MessageToast.show("Error al crear el area: " + dataRes.MESSAGE);
                            //}
                        }.bind(this))
                        .catch(function (error) {
                            BusyIndicator.hide();
                            MessageToast.show("Error al crear el area: " + (error.descripcion || error.message || "Error desconocido"));
                        });
                    } else {
                        BusyIndicator.hide(); 
                        MessageToast.show("Area eliminada exitosamente"); 
                    } 
                } 
            } catch(error) {
                BusyIndicator.hide(); 
                console.log(error);
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
        },
        onGuardarCentro: function () {
            console.log("GUARDAR centro");
            var oView = this.getView();
            var oCentroModel = oView.getModel("centroModel");
            var sCentroID = oCentroModel.getProperty("/OBJ_CO");
            var sCentroDesc = oCentroModel.getProperty("/DESC_OBJ_CO");
            //console.log(sCentroID);
            //console.log(sCentroDesc);

            if (!sCentroID || !sCentroDesc) {
                MessageToast.show("Por favor ingrese el ID y la descripción del centro");
                return;
            }

            this.guardarCentro(sCentroID, sCentroDesc);

            //this.byId("dialogCrearCentro").close();
        },
        onPressCrearCentroCosto: function () {
            var oView = this.getView();
            var oCentroModel = new JSONModel({ OBJ_CO: "", DESC_OBJ_CO: "" });
            oView.setModel(oCentroModel, "centroModel");
            if (!this.byId("dialogCrearCentro")) {
                Fragment.load({ id: oView.getId(), name: "nsnew.uisemnew.view.fragments.CrearCentro",  controller: this }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    oDialog.setTitle(`Crear Centro Costo`);  
                    oDialog.open(); 

                });
            } else {
                oCentroModel.setData({ OBJ_CO: "", DESC_OBJ_CO: "" });
                this.byId("dialogCrearCentro").open();
            }
        },
        onPressEditarCentro: function(oEvent) {
            var oButton = oEvent.getSource(); 
            var oListItem = oButton.getParent().getParent();  
            var oBindingContext = oListItem.getBindingContext("myParam"); 
            var oData = oBindingContext.getObject(); 
            //console.log("oData", oData);
            var oView = this.getView();
            var oCentroModel = new JSONModel({
                OBJ_CO: oData.OBJ_CO,
                DESC_OBJ_CO: oData.DESC_OBJ_CO 
            });
            oView.setModel(oCentroModel, "centroModel");
            if (!this.byId("dialogCrearCentro")) {
                Fragment.load({
                    id: oView.getId(),
                    name: "nsnew.uisemnew.view.fragments.CrearCentro", 
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    oDialog.setTitle(`Editar centro costo`); 
                    oDialog.open();
                });
            } else {
                oCentroModel.setData({
                    OBJ_CO: "",
                    DESC_OBJ_CO: "" 
                });
                this.byId("dialogCrearCentro").open();
            }    
        },
        guardarCentro: function (centroID, centroDesc) {
            var oModel = this.getView().getModel("myParam");
            var data = { 
                "METHOD": "C",
                "TABLA": "T_OBJ_CO",
                "OBJ_CO": centroID, 
                "DESC_OBJ_CO": centroDesc 
            };
            var urlAjax = v_url_ini + "/getAdminData.php";
            
            try {
                BusyIndicator.show(0);
                var that = this;
                if(ind_conecta_json_sap === 1) {
                    this.f_ajax('POST', urlAjax, data, oModel.getProperty("/token"))
                    .then(function (dataRes) {
                        BusyIndicator.hide();
                        //if (dataRes === "New record created successfully") {
                            MessageToast.show("Centro creado exitosamente");
                            that.f_get_datos_maestros();
                            that.onCancelar('dialogCrearCentro')
                        //} else {
                        //    MessageToast.show("Error al crear el centro: " + dataRes.MESSAGE); 
                        //    that.onCancelar('dialogCrearCentro')
                        //}
                    }.bind(this))
                    .catch(function (error) {
                        BusyIndicator.hide();
                        MessageToast.show("Error al crear el centro: " + (error.descripcion || error.message || "Error desconocido"));
                    });
                } else { 
                    BusyIndicator.hide(); 
                    MessageToast.show("Centro creado exitosamente"); 
                    that.onCancelar('dialogCrearCentro');
                } 
            } catch(error) {
                BusyIndicator.hide(); 
                console.log(error);
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
        },
        pressEliminarCentro: async function(oEvent) {
            var oModel = this.getView().getModel("myParam");

            var oButton = oEvent.getSource(); 
            var oListItem = oButton.getParent().getParent(); 
            var oBindingContext = oListItem.getBindingContext("myParam"); 
            var oData = oBindingContext.getObject(); 
            //console.log("oData", oData); 

            try {

                let ok = await this.MessageBoxPress('information', "Está seguro que quieres eliminar el registro?")
                if(ok) {
                    var urlAjax = v_url_ini + "/getAdminData.php";
                    var data = {
                        "METHOD": "D",
                        "TABLA": "T_OBJ_CO",
                        "OBJ_CO": oData.OBJ_CO
                    }
                    BusyIndicator.show(0);
                    var that = this;
                    if(ind_conecta_json_sap === 1) {
                        this.f_ajax('POST', urlAjax, data, oModel.getProperty("/token"))
                        .then(function (dataRes) {
                            BusyIndicator.hide();
                            //if (dataRes === "Record deleted successfully") {
                                MessageToast.show("Centro costo eliminado exitosamente");
                                that.f_get_datos_maestros();    
                            //} else {  
                            //    MessageToast.show("Error al eliminar el centro costo: " + dataRes.MESSAGE);
                            //}
                        }.bind(this))
                        .catch(function (error) {
                            BusyIndicator.hide();
                            MessageToast.show("Error al eliminar el centro costo: " + (error.descripcion || error.message || "Error desconocido"));
                        });
                    } else {
                        BusyIndicator.hide(); 
                        MessageToast.show("Centro costo eliminado exitosamente"); 
                    } 
                } 
            } catch(error) {
                BusyIndicator.hide(); 
                console.log(error);
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
        }, 
        onFormCentro: function() { 
            var oDialog = this.byId("dialogCrearCentro");
            var sTitle = oDialog.getTitle();  
            if (sTitle === "Editar centro costo") { 
                this.editarCentro() 
            } else {
                this.onGuardarCentro()
            }
        },
        editarCentro: function() {
            var oModel = this.getView().getModel("myParam");
            var oView = this.getView();
            var oCentroModel = oView.getModel("centroModel");

            var sID = oCentroModel.getProperty("/OBJ_CO");
            var sCentro = oCentroModel.getProperty("/DESC_OBJ_CO");  

            var data = { 
                "METHOD": "U",
                "TABLA": "T_OBJ_CO",
                "OBJ_CO": sID,
                "DESC_OBJ_CO": sCentro, 
            };
 
            var urlAjax = v_url_ini + "/getAdminData.php"; 

            try {

                BusyIndicator.show(0);
                var that = this;
                if(ind_conecta_json_sap === 1) {
                    this.f_ajax('POST', urlAjax, data, oModel.getProperty("/token"))
                    .then(function (dataRes) {
                        BusyIndicator.hide();
                        //if (dataRes === "Record updated successfully") {
                            MessageToast.show("Centro actualizado exitosamente");
                            that.f_get_datos_maestros();
                            that.onCancelar('dialogCrearCentro')
                        //} else {
                        //    that.onCancelar('dialogCrearCentro')
                        //    MessageToast.show("Error al actualizar el centro: " + dataRes.MESSAGE);
                        //}
                    }.bind(this))
                    .catch(function (error) {
                        BusyIndicator.hide();
                        MessageToast.show("Error al actualizar el centro: " + (error.descripcion || error.message || "Error desconocido"));
                    });
                } else {
                    BusyIndicator.hide(); 
                    MessageToast.show("Centro actualizado exitosamente");
                    that.onCancelar('dialogCrearCentro') 
                }
            } catch(error) {
                BusyIndicator.hide(); 
                console.log(error);
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
        },
        onPressCreaConceptoGasto: function() {
            var oView = this.getView();
            var oAreaModel = new JSONModel({ ID_CONCEPTO: "", DES_CONCEPTO: "" });
            oView.setModel(oAreaModel, "areaModel");
            if (!this.byId("dialogCrearConceptoGasto")) {
                Fragment.load({ id: oView.getId(), name: "nsnew.uisemnew.view.fragments.CrearConceptoGasto",  controller: this }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    oDialog.open();
                });
            } else {
                oAreaModel.setData({ ID_CONCEPTO: "", DES_CONCEPTO: "" });
                this.byId("dialogCrearConceptoGasto").open();
            }
        }, 
        onCancelar: function(idDialog) {
            this.byId(`${idDialog}`).close(); 
            this.byId(`${idDialog}`).destroy();  
        }, 
        onPressCreaComprobante: function () {
            var oView = this.getView();
            var oComprobanteModel = new JSONModel({
                ID_COMP: "",
                DESC_COMP: ""
            });
            oView.setModel(oComprobanteModel, "comprobanteModel");

            if (!this.byId("dialogCrearComprobante")) {
                Fragment.load({
                    id: oView.getId(),
                    name: "nsnew.uisemnew.view.fragments.CrearComprobante",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    oDialog.open();
                });
            } else {

                oComprobanteModel.setData({
                    ID_COMP: "",
                    DESC_COMP: ""
                });
                this.byId("dialogCrearComprobante").open();
            }
        },
        onGuardarComprobante: function () {
            var oView = this.getView();
            var oComprobanteModel = oView.getModel("comprobanteModel");
            var sCompID = oComprobanteModel.getProperty("/ID_COMP");
            var sCompDesc = oComprobanteModel.getProperty("/DESC_COMP");


            if (!sCompID || !sCompDesc) {
                MessageToast.show("Por favor ingrese el ID y la descripción del comprobante");
                return;
            }

            this.guardarComprobante(sCompID, sCompDesc);

            this.byId("dialogCrearComprobante").close();
        },
        onCancelarComprobante: function () {
            this.byId("dialogCrearComprobante").close();
        },
        guardarComprobante: function (compID, compDesc) {
            var oModel = this.getView().getModel("myParam");
            var data = {
                "ID_COMP": compID,
                "DESC_COMP": compDesc
            };
            var urlAjax = v_url_ini + "/getAdminData.php";

            try {

                BusyIndicator.show(0);
                if(ind_conecta_json_sap === 1) {
                    this.f_ajax('POST', urlAjax, data, oModel.getProperty("/token"))
                    .then(function (dataRes) {
                        BusyIndicator.hide();
                        if (dataRes.type == "S") {
                            MessageToast.show("Comprobante creado exitosamente");
                            this.f_get_datos_maestros();
                        } else {
                            MessageToast.show("Error al crear el comprobante: " + dataRes.MESSAGE);
                        }
                    }.bind(this))
                    .catch(function (error) {
                        BusyIndicator.hide();
                        MessageToast.show("Error al crear el comprobante: " + (error.descripcion || error.message || "Error desconocido"));
                    });
                } else {
                    BusyIndicator.hide(); 
                    MessageToast.show("Comprobante creada exitosamente"); 
                }
            } catch(error) {
                BusyIndicator.hide(); 
                console.log(error);
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
            
        },
        onGuardarUsuario: function() {
            var oView = this.getView();
            var oComprobanteModel = oView.getModel("usuarioModel");

            var sUserLogin = oComprobanteModel.getProperty("/ID_USR");
            var sSociedad = oComprobanteModel.getProperty("/SOCIEDAD"); 
            var sGrLib = oComprobanteModel.getProperty("/GPO_LIB"); 
            var sGrAut = oComprobanteModel.getProperty("/GPO_AUT"); 
            var sUserName = oComprobanteModel.getProperty("/USERNAME");

            if (!sUserLogin || !sSociedad || !sGrLib || !sGrAut || !sUserName) {
                MessageToast.show("Por favor ingrese los campos del usuario");
                return;
            }
            this.guardarUsuario(sUserLogin, sSociedad, sGrLib, sGrAut, sUserName); 
            //this.byId("dialogCrearUsuario").close();
        },
        guardarUsuario: function(sUserLogin, sSociedad, sGrLib, sGrAut, sUserName) {
            var oModel = this.getView().getModel("myParam");
            var data = { 
                "METHOD": "C",
                "TABLA": "T_USR",
                "SOCIEDAD": sSociedad,
                "ID_USR": sUserLogin,
                "GPO_LIB": sGrLib,
                "GPO_AUT": sGrAut, 
                "USERNAME": sUserName
            };
 
            var urlAjax = v_url_ini + "/getAdminData.php"; 


            try {
                BusyIndicator.show(0);
                var that = this;
                if(ind_conecta_json_sap === 1) {
                    this.f_ajax('POST', urlAjax, data, oModel.getProperty("/token"))
                    .then(function (dataRes) {
                        BusyIndicator.hide();
                        //if (dataRes === "New record created successfully") {
                            MessageToast.show("Usuario creado exitosamente");
                            that.f_get_datos_maestros();
                        //    that.onCancelar('dialogCrearUsuario');
                        //} else {
                        //    MessageToast.show("Error al crear el usuario: " + dataRes.MESSAGE);
                        //}
                    }.bind(this))
                    .catch(function (error) {
                        BusyIndicator.hide();
                        MessageToast.show("Error al crear el usuario: " + (error.descripcion || error.message || "Error desconocido"));
                    });
                } else {
                    BusyIndicator.hide(); 
                    MessageToast.show("usuario creado exitosamente");
                    that.onCancelar('dialogCrearUsuario'); 
                }
            } catch(error) {
                BusyIndicator.hide(); 
                console.log(error);
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
        }, 
        onPressCreaConceptoPago: function () {
            var oView = this.getView();
            var oConceptoPagoModel = new JSONModel({
                ID_CONCEPTO: "",
                DES_CONCEPTO: "",
                ALIMENTO: false,
                GASTO_VEHIC: false,
                LIMITE: "",
                GASTO_FLOTA: false
            });
            oView.setModel(oConceptoPagoModel, "conceptoPagoModel");
            if (!this.byId("dialogCrearConceptoPago")) {
                Fragment.load({
                    id: oView.getId(),
                    name: "nsnew.uisemnew.view.fragments.CrearConceptoPago", 
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    oDialog.setTitle(`Crear concepto pago`);  

                    oDialog.open();
                });
            } else {
                oConceptoPagoModel.setData({
                    ID_CONCEPTO: "",
                    DES_CONCEPTO: "",
                    ALIMENTO: false,
                    GASTO_VEHIC: false,
                    LIMITE: "",
                    GASTO_FLOTA: false
                });
                this.byId("dialogCrearConceptoPago").open();
            }
        }, 
        onPressCreaUsuario: function() {
            var oView = this.getView();
            var oUsuarioModel = new JSONModel({
                ID_USR: "",
                SOCIEDAD: "",
                GPO_LIB: "",
                GPO_AUT: "",
                USERNAME: "" 
            });
            oView.setModel(oUsuarioModel, "usuarioModel");
            if (!this.byId("dialogCrearUsuario")) {
                Fragment.load({
                    id: oView.getId(),
                    name: "nsnew.uisemnew.view.fragments.CrearUsuario", 
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    oDialog.setTitle(`Crear usuario`);   
                    oDialog.open();
                });
            } else {
                oUsuarioModel.setData({
                    ID_USR: "",
                    SOCIEDAD: "",
                    GPO_LIB: "",
                    GPO_AUT: "",
                    USERNAME: "" 
                });
                this.byId("dialogCrearUsuario").open();
            }
        },
        onPressEditarUsuario: function(oEvent) {
 
            var oButton = oEvent.getSource(); 
            var oListItem = oButton.getParent().getParent(); 
            //var oContext = oListItem.getBindingContext("myParam");   
            var oBindingContext = oListItem.getBindingContext("myParam"); 
            var oData = oBindingContext.getObject(); 

            //console.log("oData", oData)
            var oView = this.getView();
            var oUsuarioModel = new JSONModel({ 
                ID_USR: oData.ID_USR,
                SOCIEDAD: oData.SOCIEDAD,
                GPO_LIB: oData.GPO_LIB,
                GPO_AUT: oData.GPO_AUT,
                USERNAME: oData.USERNAME 
            });
            oView.setModel(oUsuarioModel, "usuarioModel");
            if (!this.byId("dialogCrearUsuario")) {
                Fragment.load({
                    id: oView.getId(),
                    name: "nsnew.uisemnew.view.fragments.CrearUsuario", 
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    oDialog.setTitle(`Editar usuario`);  

                    oDialog.open();
                });
            } else {
                oUsuarioModel.setData({ 
                });
                this.byId("dialogCrearUsuario").open();
            }
        },
        editarUsuario: function() {
            var oModel = this.getView().getModel("myParam");
            var oView = this.getView();
            var oUsuarioModel = oView.getModel("usuarioModel");

            var sUserLogin = oUsuarioModel.getProperty("/ID_USR");
            var sSociedad = oUsuarioModel.getProperty("/SOCIEDAD"); 
            var sGrLib = oUsuarioModel.getProperty("/GPO_LIB"); 
            var sGrAut = oUsuarioModel.getProperty("/GPO_AUT"); 
            var sUserName = oUsuarioModel.getProperty("/USERNAME");

            var data = { 
                "METHOD": "U",
                "TABLA": "T_USR",
                "SOCIEDAD": sSociedad,
                "ID_USR": sUserLogin,
                "GPO_LIB": sGrLib,
                "GPO_AUT": sGrAut,
                "USERNAME": sUserName 
            };
 
            var urlAjax = v_url_ini + "/getAdminData.php"; 


            try {
                BusyIndicator.show(0);
                var that = this;
                if(ind_conecta_json_sap === 1) {
                    this.f_ajax('POST', urlAjax, data, oModel.getProperty("/token"))
                    .then(function (dataRes) {
                        BusyIndicator.hide();
                        //if (dataRes === "Record updated successfully") {
                            MessageToast.show("Usuario actualizado exitosamente");
                            that.f_get_datos_maestros();
                            that.onCancelar('dialogCrearUsuario')
                        //} else {
                        //    that.onCancelar('dialogCrearUsuario')
                        //    MessageToast.show("Error al actualizar el usuario: " + dataRes.MESSAGE);
                        //}
                    }.bind(this))
                    .catch(function (error) {
                        BusyIndicator.hide();
                        MessageToast.show("Error al actualizar el usuario: " + (error.descripcion || error.message || "Error desconocido"));
                    });
                } else {
                    BusyIndicator.hide(); 
                    MessageToast.show("usuario actualizado exitosamente"); 
                    that.onCancelar('dialogCrearUsuario')
                }
            } catch(error) {
                BusyIndicator.hide(); 
                console.log(error);
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
        },
        onFormUsuario: function() { 
            var oDialog = this.byId("dialogCrearUsuario");
            var sTitle = oDialog.getTitle();  
            if (sTitle === "Editar usuario") { 
                this.editarUsuario() 
            } else {
                this.onGuardarUsuario()
            }
        },
        pressEliminarUsuario: async function(oEvent) {
            var oModel = this.getView().getModel("myParam");

            var oButton = oEvent.getSource(); 
            var oListItem = oButton.getParent().getParent(); 
            var oBindingContext = oListItem.getBindingContext("myParam"); 
            var oData = oBindingContext.getObject(); 
            //console.log("oData", oData); 


            try {

                let ok = await this.MessageBoxPress('information', "Está seguro que quieres eliminar el registro?")
                if(ok) {
                    var urlAjax = v_url_ini + "/getAdminData.php";
                    var data = {
                        "METHOD": "D",
                        "TABLA": "T_USR",
                        "SOCIEDAD": oData.SOCIEDAD,
                        "ID_USR": oData.ID_USR
                    }
                    BusyIndicator.show(0);
                    var that = this
                    if(ind_conecta_json_sap === 1) {
                        this.f_ajax('POST', urlAjax, data, oModel.getProperty("/token"))
                        .then(function (dataRes) {
                            BusyIndicator.hide();
                            //if (dataRes === "Record deleted successfully") {
                                MessageToast.show("usuario eliminado exitosamente");
                                that.f_get_datos_maestros(); 
                            //} else {
                            //    MessageToast.show("Error al eliminar el usuario: " + dataRes.MESSAGE);
                            //}
                        }.bind(this))
                        .catch(function (error) {
                            BusyIndicator.hide();
                            MessageToast.show("Error al eliminar el usuario: " + (error.descripcion || error.message || "Error desconocido"));
                        });
                    } else {
                        BusyIndicator.hide(); 
                        MessageToast.show("usuario eliminado exitosamente"); 
                    } 
                } 
            } catch(error) {
                BusyIndicator.hide(); 
                console.log(error);
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
        },
        formatXtoBoolean: function (sValue) {
            return sValue == "X";
        },
        onGuardarConceptoPago: function () {
            var oView = this.getView();
            //oView.setModel("conceptoPagoModel","");  
            var oConceptoPagoModel = oView.getModel("conceptoPagoModel");
            var sConceptoID = oConceptoPagoModel.getProperty("/ID_CONCEPTO");
            var sConceptoDesc = oConceptoPagoModel.getProperty("/DES_CONCEPTO"); 
            if (!sConceptoID || !sConceptoDesc) {
                MessageToast.show("Por favor ingrese el ID y la descripción del concepto de pago");
                return;
            }
            this.guardarConceptoPago(sConceptoID, sConceptoDesc);
 
            //this.byId("dialogCrearConceptoPago").close();
        },
        onFormConcepto: function() {
            var oDialog = this.byId("dialogCrearConceptoPago");
            var sTitle = oDialog.getTitle();  
            if (sTitle === "Editar concepto pago") { 
                this.editarConceptoPago() 
            } else {
                this.onGuardarConceptoPago()
            }
        },
        pressEliminarConceptoPago: async function(oEvent) {
            var oModel = this.getView().getModel("myParam");

            var oButton = oEvent.getSource(); 
            
            var oListItem = oButton.getParent().getParent(); 
            var oBindingContext = oListItem.getBindingContext("myParam"); 
            //console.log("oBindingContext", oBindingContext); 

            var oData = oBindingContext.getObject(); 
            //console.log("oData", oData); 

            try {
                
                let ok = await this.MessageBoxPress('information', "Está seguro que quieres eliminar el registro?")
                if(ok) {
                    var urlAjax = v_url_ini + "/getAdminData.php";
                    var data = {
                        "METHOD": "D",
                        "TABLA": "T_CONCEPTO",
                        "ID_CONCEPTO": oData.ID_CONCEPTO
                    }
                    BusyIndicator.show(0);
                    var that = this;
                    if(ind_conecta_json_sap === 1) {
                        this.f_ajax('POST', urlAjax, data, oModel.getProperty("/token"))
                        .then(function (dataRes) {
                            BusyIndicator.hide();
                            //if (dataRes === "Record deleted successfully") {
                                MessageToast.show("Conceptop pago eliminado exitosamente");
                                that.f_get_datos_maestros(); 
                            //} else {
                            //    MessageToast.show("Error al eliminar el concepto pago: " + dataRes.MESSAGE); 
                            //}
                        }.bind(this))
                        .catch(function (error) {
                            BusyIndicator.hide(); 
                            MessageToast.show("Error al eliminar el concepto pago: " + (error.descripcion || error.message || "Error desconocido"));
                        });
                    } else {
                        BusyIndicator.hide(); 
                        MessageToast.show("Concepto pago eliminado exitosamente"); 
                    } 
                } 
            } catch(error) {
                BusyIndicator.hide(); 
                console.log(error);
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
        },
        onCancelarConceptoPago: function () {
            this.byId("dialogCrearConceptoPago").close();
        },
        onCancelarUsuario: function () {
            this.byId("dialogCrearUsuario").close();
        },
        guardarConceptoPago: function (conceptoID, conceptoDesc) {
            var oModel = this.getView().getModel("myParam");
            var data = {
                "METHOD": 'C',
                "TABLA": 'T_CONCEPTO', 
                "ID_CONCEPTO": conceptoID,
                "DES_CONCEPTO": conceptoDesc,
            
            };
            var urlAjax = v_url_ini + "/getAdminData.php"; 

            try {
                BusyIndicator.show(0);
                var that = this;
                if(ind_conecta_json_sap === 1) {
                    this.f_ajax('POST', urlAjax, data, oModel.getProperty("/token"))
                    .then(function (dataRes) {
                        BusyIndicator.hide();
                        //if (dataRes === "New record created successfully") {
                            MessageToast.show("Concepto de pago creado exitosamente");
                            that.f_get_datos_maestros();
                            that.onCancelar('dialogCrearConceptoPago')
                        //} else {
                        //    MessageToast.show("Error al crear el concepto de pago: " + dataRes.MESSAGE);
                        //    that.onCancelar('dialogCrearConceptoPago')
                        //}
                    }.bind(this))
                    .catch(function (error) {
                        BusyIndicator.hide();
                        MessageToast.show("Error al crear el concepto de pago: " + (error.descripcion || error.message || "Error desconocido"));
                    });
                } else {
                    BusyIndicator.hide(); 
                    MessageToast.show("Concepto pago creado exitosamente");
                    that.onCancelar('dialogCrearConceptoPago') 
                }
            } catch(error) {
                BusyIndicator.hide(); 
                console.log(error);
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
        },
        onPressEditarConceptoPago: function(oEvent) {

            var oButton = oEvent.getSource(); 
            var oListItem = oButton.getParent().getParent(); 
            //var oContext = oListItem.getBindingContext("myParam");   
            var oBindingContext = oListItem.getBindingContext("myParam"); 
            var oData = oBindingContext.getObject(); 
            //console.log("oData", oData);
            var oView = this.getView();
            var oConceptoPagoModel = new JSONModel({
                ID_CONCEPTO: oData.ID_CONCEPTO,
                DES_CONCEPTO: oData.DES_CONCEPTO
            });
            oView.setModel(oConceptoPagoModel, "conceptoPagoModel");
            if (!this.byId("dialogCrearConceptoPago")) {
                //console.log("oConceptoPagoModel", oConceptoPagoModel)
                Fragment.load({
                    id: oView.getId(),
                    name: "nsnew.uisemnew.view.fragments.CrearConceptoPago", 
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    oDialog.setTitle(`Editar concepto pago`);  

                    oDialog.open();
                });
            } else {
                oConceptoPagoModel.setData({
                    ID_CONCEPTO: "",
                    DES_CONCEPTO: "" 
                });
                this.byId("dialogCrearConceptoPago").open();
            }
        },
        editarConceptoPago: function() {
            var oModel = this.getView().getModel("myParam");
            var oView = this.getView();
            var oConceptoModel = oView.getModel("conceptoPagoModel");

            var sID = oConceptoModel.getProperty("/ID_CONCEPTO");
            var sDesc = oConceptoModel.getProperty("/DES_CONCEPTO");  
            
            var data = { 
                "METHOD": "U",
                "TABLA": "T_CONCEPTO",
                "ID_CONCEPTO": sID,
                "DES_CONCEPTO": sDesc
            };
 
            var urlAjax = v_url_ini + "/getAdminData.php"; 

            try {
                BusyIndicator.show(0);
                var that = this;
                if(ind_conecta_json_sap === 1) {
                    this.f_ajax('POST', urlAjax, data, oModel.getProperty("/token"))
                    .then(function (dataRes) {
                        BusyIndicator.hide();
                        //if (dataRes === "Record updated successfully") {
                            MessageToast.show("Concepto pago actualizado exitosamente");
                            that.f_get_datos_maestros();
                            that.onCancelar('dialogCrearConceptoPago')
                        //} else {
                        //    MessageToast.show("Error al actualizar el concepto pago: " + dataRes.MESSAGE);
                        //}
                    }.bind(this))
                    .catch(function (error) {
                        BusyIndicator.hide();
                        MessageToast.show("Error al actualizar el concepto pago: " + (error.descripcion || error.message || "Error desconocido"));
                    });
                } else {
                    BusyIndicator.hide(); 
                    MessageToast.show("Concepto pago actualizado exitosamente"); 
                    that.onCancelar('dialogCrearConceptoPago')
                }
            } catch(error) {
                BusyIndicator.hide(); 
                console.log(error);
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
        },
        onPressEditarConceptoGasto: function(oEvent) { 
            var oButton = oEvent.getSource(); 
            var oListItem = oButton.getParent().getParent(); 
            //var oContext = oListItem.getBindingContext("myParam");   
            var oBindingContext = oListItem.getBindingContext("myParam"); 
            var oData = oBindingContext.getObject(); 
            //console.log("oData", oData);
            var oView = this.getView();
            var oConceptoGastoModel = new JSONModel({
                ID_CONCEPTO: oData.ID_CONCEPTO,
                DES_CONCEPTO: oData.DES_CONCEPTO
            });
            oView.setModel(oConceptoGastoModel, "conceptoGastoModel");
            if (!this.byId("dialogCrearConceptoGasto")) {
                Fragment.load({
                    id: oView.getId(),
                    name: "nsnew.uisemnew.view.fragments.CrearConceptoGasto", 
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    oDialog.open();
                });
            } else {
                oConceptoGastoModel.setData({
                    ID_CONCEPTO: "",
                    DES_CONCEPTO: "" 
                });
                this.byId("dialogCrearConceptoGasto").open();
            }
        },
        onPressEditarGrupoLiberacion: function(oEvent) {
            var oButton = oEvent.getSource(); 
            var oListItem = oButton.getParent().getParent(); 
            //var oContext = oListItem.getBindingContext("myParam");   
            var oBindingContext = oListItem.getBindingContext("myParam"); 
            var oData = oBindingContext.getObject(); 
            //console.log("oData", oData);
            var oView = this.getView();
            var oGrupoLiberacionModel = new JSONModel({
                SOCIEDAD: oData.SOCIEDAD, 
                GPO_LIB: oData.GPO_LIB, 
                TIPO: oData.TIPO, 
                USR_AP_N1: oData.USR_AP_N1,
                USR_AP_N2: oData.USR_AP_N2  
            });
            oView.setModel(oGrupoLiberacionModel, "grupoLiberacionModel");
            if (!this.byId("dialogCrearGrupoLiberacion")) {
                 Fragment.load({
                    id: oView.getId(),
                    name: "nsnew.uisemnew.view.fragments.CrearGrupoLiberacion", 
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    oDialog.setTitle(`Editar grupo liberacion`);  

                    oDialog.open();
                });
            } else {
                oGrupoLiberacionModel.setData({
                    SOCIEDAD: "", 
                    GPO_LIB: "", 
                    TIPO: "",
                    USR_AP_N1: "",
                    USR_AP_N2: ""
                });
                this.byId("dialogCrearGrupoLiberacion").open();
            }
        },
        pressEliminarGrupoLiberacion: async function(oEvent) {
 
            var oModel = this.getView().getModel("myParam");

            var oButton = oEvent.getSource(); 
            var oListItem = oButton.getParent().getParent(); 
            var oBindingContext = oListItem.getBindingContext("myParam"); 
 
            var oData = oBindingContext.getObject(); 
            //console.log("oData", oData); 


            try {
                let ok = await this.MessageBoxPress('information', "Está seguro que quieres eliminar el registro?")
                if(ok) {
                    var urlAjax = v_url_ini + "/getAdminData.php";
                    var data = {
                        "METHOD": "D",
                        "TABLA": "T_LIB",
                        "ID_CONCEPTO": oData.ID_CONCEPTO,
                        "SOCIEDAD": oData.SOCIEDAD,
                        "GPO_LIB": oData.GPO_LIB,
                        "TIPO": oData.TIPO
                    }
                    BusyIndicator.show(0);
                    var that = this;
                    if(ind_conecta_json_sap === 1) {
                        this.f_ajax('POST', urlAjax, data, oModel.getProperty("/token"))
                        .then(function (dataRes) {
                            BusyIndicator.hide();
                            //if (dataRes === "Record updated successfully") {
                                MessageToast.show("Grupo liberacion eliminado exitosamente");
                                that.f_get_datos_maestros();
                            //} else {
                            //    MessageToast.show("Error al eliminar el grupo liberacion: " + dataRes.MESSAGE);
                            //}
                        }.bind(this))
                        .catch(function (error) {
                            BusyIndicator.hide();
                            MessageToast.show("Error al eliminar el grupo liberacion: " + (error.descripcion || error.message || "Error desconocido"));
                        });
                    } else {
                        BusyIndicator.hide(); 
                        MessageToast.show("Grupo liberacion eliminado exitosamente"); 
                    } 
                } 
            } catch(error) {
                BusyIndicator.hide(); 
                console.log(error);
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
        },
        onPressCreaGrupoLiberacion: function() {
            var oView = this.getView();
            var grupoLiberacionModel = new JSONModel({ SOCIEDAD: "", GPO_LIB: "", TIPO: "", USR_AP_N1: "", USR_AP_N2:"" });
            oView.setModel(grupoLiberacionModel, "grupoLiberacionModel");
            if (!this.byId("dialogCrearGrupoLiberacion")) {
                Fragment.load({ id: oView.getId(), name: "nsnew.uisemnew.view.fragments.CrearGrupoLiberacion",  controller: this }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    oDialog.setTitle(`Crear grupo liberacion`);  

                    oDialog.open();

                });
            } else {
                grupoLiberacionModel.setData({ SOCIEDAD: "", GPO_LIB: "", TIPO: "", USR_AP_N1: "", USR_AP_N2:"" });
                this.byId("dialogCrearGrupoLiberacion").open();
            }
        },
        onGuardarGrupoLiberacion: function() {
            var oView = this.getView();
            //oView.setModel("conceptoPagoModel","");  
            var oGrupoLiberacionModel = oView.getModel("grupoLiberacionModel");
            var sSociedad = oGrupoLiberacionModel.getProperty("/SOCIEDAD");
            var gpo_liberacion = oGrupoLiberacionModel.getProperty("/GPO_LIB"); 
            var tipo = oGrupoLiberacionModel.getProperty("/TIPO"); 
            var apro1 = oGrupoLiberacionModel.getProperty("/USR_AP_N1"); 
            var apro2 = oGrupoLiberacionModel.getProperty("/USR_AP_N2"); 

            if (!sSociedad || !gpo_liberacion || !tipo  || !apro1 || !apro2) {
                MessageToast.show("Por favor ingrese los campos del formulario");
                return;
            }
            this.guardarGrupoLiberacion(sSociedad, gpo_liberacion, tipo, apro1, apro2);
 
            //this.byId("dialogCrearGrupoLiberacion").close();
        },
        guardarGrupoLiberacion: function(sSociedad, gpo_liberacion, tipo, apro1, apro2){
            var oModel = this.getView().getModel("myParam");
            var data = {
                "METHOD": 'C',
                "TABLA": 'T_LIB', 
                "SOCIEDAD": sSociedad,
                "GPO_LIB": gpo_liberacion,
                "TIPO": tipo,
                "USR_AP_N1": apro1,
                "USR_AP_N2": apro2
            }
            var urlAjax = v_url_ini + "/getAdminData.php"; 

            try {
                BusyIndicator.show(0);
                var that = this;
                if(ind_conecta_json_sap === 1) {
                    this.f_ajax('POST', urlAjax, data, oModel.getProperty("/token"))
                    .then(function (dataRes) {
                        BusyIndicator.hide();
                        //if (dataRes === "New record created successfully") {
                            MessageToast.show("Grupo liberacion creado exitosamente");
                            that.f_get_datos_maestros();
                            that.onCancelar('dialogCrearGrupoLiberacion');
                        //} else {
                        //    MessageToast.show("Error al crear el grupo liberacion: " + dataRes.MESSAGE);
                        //}
                    }.bind(this))
                    .catch(function (error) {
                        BusyIndicator.hide();
                        MessageToast.show("Error al crear el grupo liberacion: " + (error.descripcion || error.message || "Error desconocido"));
                    });
                } else {
                    BusyIndicator.hide();
                    MessageToast.show("Grupo liberacion creado exitosamente"); 
                    that.onCancelar('dialogCrearGrupoLiberacion'); 
                }
            } catch(error) {
                BusyIndicator.hide(); 
                console.log(error);
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

        },
        editarGrupoLiberacion: function() {
            var oModel = this.getView().getModel("myParam");
            var oView = this.getView();
            var oGrupoLibModel = oView.getModel("grupoLiberacionModel");

            var sSociedad = oGrupoLibModel.getProperty("/SOCIEDAD");
            var sGrLib = oGrupoLibModel.getProperty("/GPO_LIB"); 
            var sTipo = oGrupoLibModel.getProperty("/TIPO"); 
            var sUsrAp1 = oGrupoLibModel.getProperty("/USR_AP_N1"); 
            var sUsrAp2 = oGrupoLibModel.getProperty("/USR_AP_N2"); 

            var data = { 
                "METHOD": "U",
                "TABLA": "T_LIB",
                "SOCIEDAD": sSociedad,
                "GPO_LIB": sGrLib,
                "TIPO": sTipo,
                "USR_AP_N1": sUsrAp1, 
                "USR_AP_N2": sUsrAp2  
            };
 
            var urlAjax = v_url_ini + "/getAdminData.php"; 

            try {
                BusyIndicator.show(0);
                var that = this;
                if(ind_conecta_json_sap === 1) {
                    this.f_ajax('POST', urlAjax, data, oModel.getProperty("/token"))
                    .then(function (dataRes) {
                        BusyIndicator.hide();
                        //if (dataRes ==="Record updated successfully") {
                            MessageToast.show("Grupo liberacion actualizado exitosamente");
                            that.f_get_datos_maestros();
                            that.onCancelar('dialogCrearGrupoLiberacion')
                        //} else {
                        //    MessageToast.show("Error al actualizar el grupo de liberacion: " + dataRes.MESSAGE);
                        //}
                    }.bind(this))
                    .catch(function (error) {
                        BusyIndicator.hide();
                        MessageToast.show("Error al actualizar el grupo de liberacion: " + (error.descripcion || error.message || "Error desconocido"));
                    });
                } else {
                    BusyIndicator.hide(); 
                    MessageToast.show("Grupo de liberacion actualizado exitosamente"); 
                    that.onCancelar('dialogCrearGrupoLiberacion')

                }
            } catch(error) {
                BusyIndicator.hide(); 
                console.log(error);
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

        },
        onFormGrupoLiberacion: function() { 
            var oDialog = this.byId("dialogCrearGrupoLiberacion");
            var sTitle = oDialog.getTitle(); 
            if (sTitle === "Editar grupo liberacion") {
                this.editarGrupoLiberacion()
            } else {
                this.onGuardarGrupoLiberacion() 
            }
        },
        onPressActivacionSunat: function(oEvent) {
            var oModel = this.getView().getModel("myParam");
            var oView = this.getView();
 
            var oCheckBox = oEvent.getSource(); 
            var oContext = oCheckBox.getBindingContext("myParam"); 
            var oData = oContext.getObject(); 
            //console.log("Datos de la fila seleccionada:", oData);  
            if (oData.EST_VAL === "X") {
                oData.EST_VAL = ""
            } else {
                oData.EST_VAL = "X" 
            }
            var data = {
                "METHOD": "U",
                "TABLA": "T_VALIDACION",
                "SOCIEDAD": oData.SOCIEDAD,
                "DESC_VAL": oData.DESC_VAL,
                "EST_VAL": oData.EST_VAL
            }

            var urlAjax = v_url_ini + "/getAdminData.php"; 
             
            try {
                BusyIndicator.show(0);
                var that = this;
                if(ind_conecta_json_sap === 1) {
                    this.f_ajax('POST', urlAjax, data, oModel.getProperty("/token"))
                    .then(function (dataRes) {
                            //console.log("dataRes", dataRes)
                            BusyIndicator.hide(); 
                            MessageToast.show("Estado actualizado exitosamente");
                            that.f_get_datos_maestros();
                    }.bind(this))
                    .catch(function (error) {
                        BusyIndicator.hide();
                        MessageToast.show("Error al actualizar el usuario: " + (error.descripcion || error.message || "Error desconocido"));
                    });
                } else {
                    BusyIndicator.hide(); 
                    MessageToast.show("Estado actualizado exitosamente"); 
                 }
            } catch(error) {
                BusyIndicator.hide(); 
                console.log(error);
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
        },
        onPressExcelGrupoLiberacion: function() {
            var aColumns = [
                { label: 'Sociedad', property: 'SOCIEDAD', type: 'string' },
                { label: 'Grupo Liberacion', property: 'GPO_LIB', type: 'string' },
                { label: 'Tipo', property: 'TIPO', type: 'string' }, 
                { label: 'Aprobador 1', property: 'USR_AP_N1', type: 'string' },
                { label: 'Aprobador 2', property: 'USR_AP_N2', type: 'string' },
            ];
            this.exportTableToExcel("/listaGrupoLiberacion", aColumns, "ReporteGrupoLiberacion.xlsx");
        },
        onPressExcelCentroCosto: function () {
            var aColumns = [
                { label: 'ID CECO', property: 'OBJ_CO', type: 'string' },
                { label: 'Descripción', property: 'DESC_OBJ_CO', type: 'string' }
            ];
            this.exportTableToExcel("/listaObj_Co", aColumns, "ReporteCECO.xlsx");
        }, 
        onPressExcelArea: function () {
            var aColumns = [
                { label: 'ID Área', property: 'AREA', type: 'string' },
                { label: 'Descripción', property: 'DESC_AREA', type: 'string' },
                { label: 'OBJ_CO', property: 'OBJ_CO', type: 'string' }
            ];
            this.exportTableToExcel("/listaAreas", aColumns, "ReporteAreas.xlsx");
        },
        onPressExcelComprobante: function () {
            var aColumns = [
                { label: 'ID Comprobante', property: 'TIP_COMP', type: 'string' },
                { label: 'Descripción', property: 'DESC_COMP', type: 'string' },
                { label: 'País', property: 'PAIS', type: 'string' }
            ];
            this.exportTableToExcel("/listaComprobantes", aColumns, "ReporteComprobantes.xlsx");
        },
        onPressExcelConceptoPago: function () {
            var aColumns = [
                { label: 'ID Concepto', property: 'ID_CONCEPTO', type: 'string' },
                { label: 'Descripción', property: 'DES_CONCEPTO', type: 'string' }
            ];
            this.exportTableToExcel("/listaConceptosPago", aColumns, "ReporteConceptosPago.xlsx");
        }, 
        onPressExcelUsuarios: function() {
            var aColumns = [
                { label: 'ID USUARIO', property: 'ID_USR', type: 'string' },
                { label: 'Sociedad', property: 'SOCIEDAD', type: 'string' },
                { label: 'Grupo. Liberacion', property: 'GPO_LIB', type: 'string' },
                { label: 'Grupo. aut', property: 'GPO_AUT', type: 'string' }
            ];
            this.exportTableToExcel("/usuariosADM", aColumns, "ReporteUsuarios.xlsx");
        },   
        
        exportTableToExcel: function (sModelPath, aColumns, sFileName) {
            var oModel = this.getView().getModel("myParam");
            var aData = oModel.getProperty(sModelPath);
        
            if (!aData || aData.length == 0) {
                MessageToast.show("No hay datos para exportar");
                return;
            }
        
            var oSettings = {
                workbook: {
                    columns: aColumns
                },
                dataSource: aData,
                fileName: sFileName
            };
        
            var oSheet = new Spreadsheet(oSettings);
            oSheet.build()
                .then(function () {
                    MessageToast.show("Archivo exportado con éxito");
                })
                .catch(function (oError) {
                    MessageToast.show("Error al exportar el archivo: " + oError);
                });
        },
        f_format_tipo_solicitud: function (p_tipo) {
            var oModel = this.getView().getModel("myParam"); 
            var v_tabla = oModel.getProperty("/T_TIPO_SOLICITUD");

            if (p_tipo != null && p_tipo != undefined && p_tipo != "" && v_tabla != undefined && v_tabla != "") {
                var v_obj_buscado = v_tabla.find(function(item) { return item.id == p_tipo; });
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
                var v_obj_buscado = v_tabla.find(function(item) { return item.id == p_tipo; });
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
                var v_obj_buscado = v_tabla.find(function(item) { return item.id == p_tipo; });
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
                var v_obj_buscado = v_tabla.find(function(item) { return item.id == p_tipo; });
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
                var v_obj_buscado = v_tabla.find(function(item) { return item.id == p_tipo; });
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
                var v_obj_buscado = v_tabla.find(function(item) { return item.ID_CONCEPTO == p_tipo; });
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
                var v_obj_buscado = v_tabla.find(function(item) { return item.TIP_COMP == p_tipo; });
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
                var v_obj_buscado = v_tabla.find(function(item) { return item.id == p_tipo; });
                if (v_obj_buscado) { return v_obj_buscado.descripcion; } 
                else { return p_tipo; }
            } else {
                return p_tipo;
            }
        }, 
    });

});