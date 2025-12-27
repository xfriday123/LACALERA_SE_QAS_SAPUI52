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

    var ind_conecta_json_sap = "1";
    var v_url_ini = "/cpblcase";

    return Controller.extend("nsnew.uisemnew.controller.Vista_Liberador_Anticipo", {
        onInit: function () {
            this.getRouter().getRoute("Vista_Liberador_Anticipo").attachMatched(this._onRouteMatched, this); 
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
        onAfterRendering: async function () {
            console.log('afterrendering llama routematched');
            this._onRouteMatched(); 
        },
        _onRouteMatched: async function () {

            var oModel = this.getView().getModel("myParam");  
            oModel.setProperty("/listaAnticipos", []); 
            oModel.setProperty("/list_consulta_aprobacion_cab", []);  
            
            this.f_get_lista_anticipo(); 
        },
        f_logout: function () {
            window.location.replace('./logout');
        },
        getRouter: function () { return sap.ui.core.UIComponent.getRouterFor(this); },
        pressVolver: function () {
            this.getRouter().navTo("Vista_Menu_Principal");
        },
        onSearch: function (oEvt) {
            var aFilters = [];
            var aFiltersG = [];
            var realizarFiltro = true;
            var sQuery = oEvt.getSource().getValue();
            var list = this.byId("idTablaLiberadorAnticipo");
            var binding = list.getBinding("items");
            if (sQuery && sQuery.length > 0) {
                var filter = new sap.ui.model.Filter("ID_SOL", sap.ui.model.FilterOperator.Contains, sQuery);
                aFilters.push(filter); 
                aFiltersG.push(new sap.ui.model.Filter(aFilters, false));
                realizarFiltro = false;
            }
            if (!realizarFiltro) {
                binding.filter(new sap.ui.model.Filter(aFiltersG, true));
            } else {
                binding.filter([]);
            } 
        },
        onItemPress: function (oEvent) {
            console.log("escoge");
            var oSelectedItem = oEvent.getParameter("listItem");
            if (!oSelectedItem) {
                console.log("No se pudo obtener el ítem seleccionado.");
                return;
            }
            var oContext = oSelectedItem.getBindingContext("myParam");
            if (!oContext) {
                console.log("No se pudo obtener el contexto del ítem seleccionado.");
                return;
            }
            var oModel = this.getView().getModel("myParam");
            this.getView().byId("objectAnticipo").bindElement({
                path: oContext.getPath(),
                model: "myParam"
            });
            //console.log(oContext);
            var ID_SOL = oModel.getProperty(oContext.getPath() + "/ID_SOL");
            this.f_act_solicitud(ID_SOL);
            this.getView().byId("obj_nro_solicitud").setText(oModel.getProperty(oContext.getPath() + "/ID_SOL"));
            this.getView().byId("obj_fecha_solicitud").setText(oModel.getProperty(oContext.getPath() + "/FEC_SOL"));
            this.getView().byId("obj_solicitante").setText( this.f_format_t_nombre_usuario(oModel.getProperty(oContext.getPath() + "/USR_SOL")) );  
            this.getView().byId("obj_sociedad").setText(oModel.getProperty(oContext.getPath() + "/SOCIEDAD"));
            this.getView().byId("obj_tipo_solicitud").setText( this.f_format_tipo_solicitud(oModel.getProperty(oContext.getPath() + "/TIP_SOL")) );
            this.getView().byId("obj_estado_solicitud").setText( this.f_format_est_sol( oModel.getProperty(oContext.getPath() + "/EST_SOL")) );
        },
        f_eliminar_anticipo: async function() {
            var dataRes = null;
            var oModel = this.getView().getModel("myParam");
            var item = this.getView().byId("idAnticipoesTable").getSelectedItem();
             
            if (!item) { 
                sap.m.MessageBox.information("Debe seleccionar 1 registro.");
                return;
            } 

            var estado_solicitud = this.getView().byId("obj_estado_solicitud").getText();

            var ind_esta_borrado = false;
            if(estado_solicitud === "Borrado") {
                ind_esta_borrado = true;
            }

            if(ind_esta_borrado) {
                sap.m.MessageBox.information("No se puede rechazar un anticipo, de una solicitud ya borrada.");
                return;
            }

            try {
                const url = v_url_ini + "/postAnt.php"; 
                
                var item = this.getView().byId("idAnticipoesTable").getSelectedItem();
                var objeto = item.getBindingContext("myParam").getObject();
                 
                if(ind_conecta_json_sap == "1") {
                    let data = { 
                        METHOD: "U", 
                        EST_ORD: "R",
                        ID_ORD: objeto.ID_ORD
                    }
              
                    dataRes = await this.f_ajax('POST', url, data, oModel.getProperty("/token"));
                } else { 
                    dataRes = "Record updated successfully";
                    
                }
                if(dataRes != undefined && dataRes[0] != undefined && dataRes[0].type != undefined && dataRes[0].type == "E") {
                    if(dataRes[0].MESSAGE == undefined){ MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor"); }
                    else { MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor (" + dataRes[0].MESSAGE + ")");  }
                    return;
                } else {    
                    //if(dataRes == "Record updated successfully") { 
                        MessageToast.show(`Anticipo rechazado correctamente`);   
                        //var oBindingContext = this.getView().byId("objectAnticipo").getBindingContext("myParam");
                        //var ID_SOL = oBindingContext.getProperty("ID_SOL");  
                        //this.f_act_solicitud(ID_SOL)
                        this.f_get_lista_anticipo(); 
                        oModel.setProperty("/listaAnticipos", []); 
                        this.f_limpiar_cabecera()
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
        }, 
        f_liberar_anticipo: async function() { 
            var dataRes = null;
            var oModel = this.getView().getModel("myParam");
            var item = this.getView().byId("idAnticipoesTable").getSelectedItem();
             
            if (!item) { 
                sap.m.MessageBox.information("Debe seleccionar 1 registro.");
                return;
            } 
            var estado_solicitud = this.getView().byId("obj_estado_solicitud").getText();

            var ind_esta_borrado = false;
            if(estado_solicitud === "Borrado") {
                ind_esta_borrado = true;
            }

            if(ind_esta_borrado) {
                sap.m.MessageBox.information("No se puede liberar un anticipo, de una solicitud ya borrada.");
                return;
            }

            try {
                const url = v_url_ini + "/getLibAnt.php"; 
                let SOC = oModel.getProperty("/empresa_seleccionada");  
                var item = this.getView().byId("idAnticipoesTable").getSelectedItem();
                var objeto = item.getBindingContext("myParam").getObject();
                


                if(ind_conecta_json_sap == "1") {
                    let data = {
                        SOCIEDAD: SOC, 
                        ID_ORD: objeto.ID_ORD
                    } 
                    dataRes = await this.f_ajax('POST', url, data, oModel.getProperty("/token"));
                } else { 
                   dataRes = "Status updated successfully";
                    
                }
                if(dataRes != undefined && dataRes[0] != undefined && dataRes[0].type != undefined && dataRes[0].type == "E") {
                    if(dataRes[0].MESSAGE == undefined){ MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor"); }
                    else { MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor (" + dataRes[0].MESSAGE + ")");  }
                    return;
                } else {    
                    //if(dataRes == "Status updated successfully") { 
                        sap.m.MessageBox.information(`Anticipo liberado correctamente`);   
                        this.f_get_lista_anticipo(); 
                        oModel.setProperty("/listaAnticipos", []); 
                        this.f_limpiar_cabecera()
                    //} else { 
                    //    MessageToast.show("Error en la respuesta del servidor, póngase en contacto con el proveedor"); 
                    //    return;
                    //}  
                } 
            } catch(error) {
                BusyIndicator.hide(); 
                console.log(error);
                if(error == undefined){ 
                    MessageToast.show(error);
                }
                else { 
                    if(error.descripcion != undefined) { MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor (" + error.descripcion + ")"); }
                    else if(error.message != undefined) { MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor (" + error.message + ")"); }
                    else { MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor"); }                            
                }
                return;
            }
        },
        f_get_lista_anticipo: async function() {
            var dataRes = null;
            var urlAjax;
            var oModel = this.getView().getModel("myParam"); 
            var v_sociedad = oModel.getProperty("/empresa_seleccionada");
            
            try {
                urlAjax = v_url_ini + `/getLibAnt.php?SOC=${v_sociedad}`;
                
                if(ind_conecta_json_sap == "1") {
                    BusyIndicator.show(0);
                    let data = "";
                    dataRes = await this.f_ajax('GET', urlAjax, data, oModel.getProperty("/token"));
                    BusyIndicator.hide();
                    dataRes = JSON.parse(dataRes)
                }
                else {
                    // Datos simulados si no hay conexión
                    dataRes = [{"ID_ORD":"8","ID_SOL":"3","DES_ORD":"Anticipo","EST_ORD":"P","FEC_ORD":"2024-08-31","IMP_ORD":"20.00","MON_ORD":"PEN","SOCIEDAD":"1000","USR_AP_N1":"JCLIRA","USR_AP_N2":"ADLIRA","EST_LIB":"","ERP_OBJTYPE":null,"ERP_OBJKEY":null,"USR_CREA":"","FEC_CREA":"2024-09-01 23:23:45","USR_MOD":null,"FEC_MOD":null,"TIP_SOL":"ERE","FEC_SOL":"2024-09-01","EST_SOL":"C","MOT_SOL":"Solicitud","USR_SOL":"adlira"},{"ID_ORD":"9","ID_SOL":"3","DES_ORD":"Anticipo","EST_ORD":"C","FEC_ORD":"2024-08-31","IMP_ORD":"20.00","MON_ORD":"PEN","SOCIEDAD":"1000","USR_AP_N1":"JCLIRA","USR_AP_N2":"ADLIRA","EST_LIB":"","ERP_OBJTYPE":null,"ERP_OBJKEY":null,"USR_CREA":"","FEC_CREA":"2024-09-01 23:23:45","USR_MOD":null,"FEC_MOD":null,"TIP_SOL":"ERE","FEC_SOL":"2024-09-01","EST_SOL":"C","MOT_SOL":"Solicitud","USR_SOL":"adlira"},{"ID_ORD":"11","ID_SOL":"3","DES_ORD":"Anticipo","EST_ORD":"C","FEC_ORD":"2024-08-31","IMP_ORD":"20.00","MON_ORD":"PEN","SOCIEDAD":"1000","USR_AP_N1":"JCLIRA","USR_AP_N2":"ADLIRA","EST_LIB":"","ERP_OBJTYPE":null,"ERP_OBJKEY":null,"USR_CREA":"","FEC_CREA":"2024-09-01 23:23:45","USR_MOD":null,"FEC_MOD":null,"TIP_SOL":"ERE","FEC_SOL":"2024-09-01","EST_SOL":"C","MOT_SOL":"Solicitud","USR_SOL":"adlira"},{"ID_ORD":"26","ID_SOL":"25","DES_ORD":"req","EST_ORD":"C","FEC_ORD":"2024-10-02","IMP_ORD":"100.00","MON_ORD":"PEN","SOCIEDAD":"1000","USR_AP_N1":"JCLIRA","USR_AP_N2":"ADLIRA","EST_LIB":"","ERP_OBJTYPE":null,"ERP_OBJKEY":null,"USR_CREA":"jclira","FEC_CREA":"2024-09-30 23:01:46","USR_MOD":null,"FEC_MOD":null,"TIP_SOL":"ERE","FEC_SOL":"2024-09-30","EST_SOL":"C","MOT_SOL":"Pasaje","USR_SOL":"jclira"},{"ID_ORD":"33","ID_SOL":"38","DES_ORD":"d","EST_ORD":"C","FEC_ORD":"2024-10-05","IMP_ORD":"100.00","MON_ORD":"PEN","SOCIEDAD":"1000","USR_AP_N1":"JCLIRA","USR_AP_N2":"ADLIRA","EST_LIB":"","ERP_OBJTYPE":null,"ERP_OBJKEY":null,"USR_CREA":"fsoto","FEC_CREA":"2024-10-05 21:25:34","USR_MOD":null,"FEC_MOD":null,"TIP_SOL":"CJC","FEC_SOL":"2024-10-05","EST_SOL":"C","MOT_SOL":"caja chica 1","USR_SOL":"fsoto"},{"ID_ORD":"48","ID_SOL":"45","DES_ORD":"a","EST_ORD":"C","FEC_ORD":"2024-10-18","IMP_ORD":"100.00","MON_ORD":"PEN","SOCIEDAD":"1000","USR_AP_N1":"JCLIRA","USR_AP_N2":"ADLIRA","EST_LIB":"","ERP_OBJTYPE":null,"ERP_OBJKEY":null,"USR_CREA":"jclira","FEC_CREA":"2024-10-06 00:32:33","USR_MOD":null,"FEC_MOD":null,"TIP_SOL":"ERE","FEC_SOL":"2024-10-05","EST_SOL":"C","MOT_SOL":"texto","USR_SOL":"jclira"},{"ID_ORD":"49","ID_SOL":"63","DES_ORD":"des","EST_ORD":"C","FEC_ORD":"2024-10-04","IMP_ORD":"120.00","MON_ORD":"PEN","SOCIEDAD":"1000","USR_AP_N1":"JCLIRA","USR_AP_N2":"ADLIRA","EST_LIB":"","ERP_OBJTYPE":null,"ERP_OBJKEY":null,"USR_CREA":"jclira","FEC_CREA":"2024-10-07 04:46:39","USR_MOD":null,"FEC_MOD":null,"TIP_SOL":"ERE","FEC_SOL":"2024-10-06","EST_SOL":"C","MOT_SOL":"test","USR_SOL":"jclira"},{"ID_ORD":"50","ID_SOL":"99","DES_ORD":"Req","EST_ORD":"C","FEC_ORD":"2024-10-08","IMP_ORD":"100.00","MON_ORD":"PEN","SOCIEDAD":"1000","USR_AP_N1":"JCLIRA","USR_AP_N2":"ADLIRA","EST_LIB":"","ERP_OBJTYPE":null,"ERP_OBJKEY":null,"USR_CREA":"fsoto","FEC_CREA":"2024-10-07 23:23:00","USR_MOD":null,"FEC_MOD":null,"TIP_SOL":"CCH","FEC_SOL":"2024-10-15","EST_SOL":"C","MOT_SOL":"test","USR_SOL":"fsoto"},{"ID_ORD":"59","ID_SOL":"116","DES_ORD":"test","EST_ORD":"C","FEC_ORD":"2024-10-08","IMP_ORD":"100.00","MON_ORD":"PEN","SOCIEDAD":"1001","USR_AP_N1":"JCLIRA","USR_AP_N2":"ADLIRA","EST_LIB":"","ERP_OBJTYPE":null,"ERP_OBJKEY":null,"USR_CREA":"jclira","FEC_CREA":"2024-10-10 22:57:45","USR_MOD":null,"FEC_MOD":null,"TIP_SOL":"ERE","FEC_SOL":"2024-10-24","EST_SOL":"C","MOT_SOL":"test","USR_SOL":"jclira"},{"ID_ORD":"60","ID_SOL":"120","DES_ORD":"COMPRAS WEB","EST_ORD":"C","FEC_ORD":"2024-10-07","IMP_ORD":"150.00","MON_ORD":"PEN","SOCIEDAD":"1001","USR_AP_N1":"JCLIRA","USR_AP_N2":"ADLIRA","EST_LIB":"","ERP_OBJTYPE":null,"ERP_OBJKEY":null,"USR_CREA":"fsoto","FEC_CREA":"2024-10-11 17:07:05","USR_MOD":null,"FEC_MOD":null,"TIP_SOL":"ERE","FEC_SOL":"2024-10-07","EST_SOL":"C","MOT_SOL":"COMPRAS WEB","USR_SOL":"fsoto"}]

                }                                                                               
                if(dataRes != undefined && dataRes[0] != undefined && dataRes[0].type != undefined && dataRes[0].type == "E") {
                    if(dataRes[0].MESSAGE == undefined){ MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor"); }
                    else { MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor (" + dataRes[0].MESSAGE + ")");  }
                    return;
                } else {
                    

                    const arraySinDuplicados = dataRes.reduce((acumulador, item) => {
                        // Verificar si el item tiene la sociedad correcta
                        if (item.SOCIEDAD == v_sociedad) {
                            // Verificar que no esté duplicado (ID_SOL único)
                            if (!acumulador.some(obj => obj.ID_SOL == item.ID_SOL)) {
                                acumulador.push(item);
                            }
                        }
                        return acumulador;
                    }, []);


                    oModel.setProperty("/listaSolicitudes_distinct", dataRes);
                    oModel.setProperty("/listaSolicitudes_pendientes_liberar_total", dataRes);

                }  
            } catch(error) {
                BusyIndicator.hide(); 
                console.log(error);
                if(error == undefined){ 
                    MessageToast.show(error);
                }
                else { 
                    if(error.descripcion != undefined) { MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor (" + error.descripcion + ")"); }
                    else if(error.message != undefined) { MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor (" + error.message + ")"); }
                    else { MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor"); }                            
                }
                return;
            }
        },
        f_limpiar_cabecera: function() {
            this.getView().byId("obj_nro_solicitud").setText("");
            this.getView().byId("obj_fecha_solicitud").setText("");
            this.getView().byId("obj_solicitante").setText("");  
            this.getView().byId("obj_sociedad").setText("");
            this.getView().byId("obj_tipo_solicitud").setText("");
            this.getView().byId("obj_estado_solicitud").setText("");
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
        f_act_solicitud: async function(ID_SOL) {
           
            var dataRes = null;
            var urlAjax;

            var oModel = this.getView().getModel("myParam"); 
            
            try {
                dataRes = oModel.getProperty("/listaSolicitudes_pendientes_liberar_total");

                var dataRes_filtered = dataRes.filter(function(item) {
                    return item.ID_SOL == ID_SOL;  
                });

                oModel.setProperty("/listaAnticipos", dataRes_filtered);  
                console.log('selecciona los anticipos');

            } catch(error) {
                BusyIndicator.hide(); 
                console.log(error);
                if(error == undefined){ 
                    MessageToast.show(error);
                }
                else { 
                    if(error.descripcion != undefined) { MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor (" + error.descripcion + ")"); }
                    else if(error.message != undefined) { MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor (" + error.message + ")"); }
                    else { MessageToast.show("Error en la consulta al servidor, póngase en contacto con el proveedor"); }                            
                }
                return;
            }
        },
        f_dialog_show: function(idDialog, namespace, title= 'Formulario') { 
            var oView = this.getView(); 
            if (this.ogDialog) {
                this.ogDialog.destroy(); 
            }; 
            this.ogDialog = sap.ui.xmlfragment(`${idDialog}`, `nsnew.uisemnew.view.fragments.${namespace}`, this) 
            oView.addDependent(this.ogDialog);
            this.ogDialog.setTitle(`${title}`);
            return this.ogDialog;
        },
        f_guardar: function (idDialog, namespace, type = 'liquidacion') {  
            this.f_dialog_show(`${idDialog}`, `${namespace}`).close();
        },
        f_cerrar: function (idDialog, namespace) {
            this.f_dialog_show(`${idDialog}`, `${namespace}`).close();
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
        f_cambiar_estado: function(sMethod) {
            var oTable = this.byId("idAnticipoesTable"); // Referencia a la tabla de liquidaciones
            var aSelectedItems = oTable.getSelectedItems(); // Obtener los elementos seleccionados
            if (aSelectedItems.length == 0) {
                MessageToast.show("Seleccione un anticipo para procesar.");
                return;
            }
            aSelectedItems.forEach(function(oSelectedItem) {
                var oContext = oSelectedItem.getBindingContext("myParam");
                var sIdLiq = oContext.getProperty("ID_ORD");
                var oPayload = {
                    "METHOD": sMethod,  
                    "ID_ORD": sIdLiq
                };
                this._enviarSolicitudLiberacion(oPayload);
            }.bind(this));
        },
        _enviarSolicitudLiberacion: function(oPayload) {
            var sUrl = v_url_ini + "/postAnt.php";
            $.ajax({
                url: sUrl,
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify(oPayload),
                success: function(response) {
                    MessageToast.show("Anticipo" + oPayload.ID_ORD + " procesada exitosamente con el método " + oPayload.METHOD + ".");
                },
                error: function(error) {
                    MessageBox.error("Error al procesar el anticipo " + oPayload.ID_ORD + " con el método " + oPayload.METHOD);
                }
            });
        }
    });
});