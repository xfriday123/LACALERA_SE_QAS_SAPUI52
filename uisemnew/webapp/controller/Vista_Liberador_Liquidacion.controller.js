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

    return Controller.extend("nsnew.uisemnew.controller.Vista_Liberador_Liquidacion", {
        onInit: function () {
            this.getRouter().getRoute("Vista_Liberador_Liquidacion").attachMatched(this._onRouteMatched, this); 
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
                    //console.log('result onBeforeRendering');
                    //console.log(result);
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
            oModel.setProperty("/listaLiquidaciones", []); 
            oModel.setProperty("/list_consulta_aprobacion_cab", []);   
            this.f_get_lista_solicitudes(); 
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
            var list = this.byId("tabla_liberacion_liquidacion");
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
            this.getView().byId("tabla_liquidacion").bindElement({
                path: oContext.getPath(),
                model: "myParam"
            });
            var ID_SOL = oModel.getProperty(oContext.getPath() + "/ID_SOL");
            this.f_act_solicitud(ID_SOL);
            this.getView().byId("obj_nro_solicitud_vista_liq").setText(oModel.getProperty(oContext.getPath() + "/ID_SOL"));
            this.getView().byId("obj_fecha_sol_vista_liq").setText(oModel.getProperty(oContext.getPath() + "/FEC_SOL"));
            this.getView().byId("obj_solicitante_vista_liq").setText( this.f_format_t_nombre_usuario(oModel.getProperty(oContext.getPath() + "/USR_SOL")) ); 
            this.getView().byId("obj_sociedad_vista_liq").setText(oModel.getProperty(oContext.getPath() + "/SOCIEDAD"));
            this.getView().byId("obj_tipo_solicitud_vista_liq").setText( this.f_format_tipo_solicitud(oModel.getProperty(oContext.getPath() + "/TIP_SOL")) );
            this.getView().byId("obj_estado_solicitud_vista_liq").setText( this.f_format_est_sol( oModel.getProperty(oContext.getPath() + "/EST_SOL")) );
        },
        f_ver_detalle: function(oEvent) { 
            var oSelectedItem = oEvent.getSource().getParent();  
            var oContext = oSelectedItem.getBindingContext("myParam");

            this.f_dialog_show('DetalleLiquidacion', 'DetalleLiquidacion', 'Detalle liquidacion gastos');

            var oModel = this.getView().getModel("myParam");
            var v_id_liq = oModel.getProperty(oContext.getPath() + "/ID_LIQ");  
            var v_id_sol = oModel.getProperty(oContext.getPath() + "/ID_SOL");  
            this.f_ver_liquidacion(v_id_liq, v_id_sol); 
        },
        f_cancelar: function (idDialog, namespace) {
            this.ogDialog.destroy(); 
        },

        /* 
        onShowPress: function (oEvent) { 
            var oSelectedItem = oEvent.getSource().getParent();  
            var oContext = oSelectedItem.getBindingContext("myParam");  
 
            if (!this._oDialog) {
                this._oDialog = sap.ui.xmlfragment("nsnew.uisemnew.view.fragments.DetalleLiquidacion", this);
                this.getView().addDependent(this._oDialog);
            } 
            var oModel = this.getView().getModel("myParam");
            var v_id_liq = oModel.getProperty(oContext.getPath() + "/ID_LIQ");  
            var v_id_sol = oModel.getProperty(oContext.getPath() + "/ID_SOL");  
 
            this._oDialog.setTitle("Detalle liquidación gastos");
            this.f_ver_liquidacion(v_id_liq, v_id_sol); 
            this._oDialog.open();
        },
        
        onDialogClose: function () {
            this._oDialog.close();
        },
        */
        f_liberar_liquidacion: async function() {
            var dataRes = null;
            var oModel = this.getView().getModel("myParam"); 

            var item = this.getView().byId("idLiquidacionesTable").getSelectedItem();
             
            if (!item) { 
                sap.m.MessageBox.information("Debe seleccionar 1 registro.");
                return;
            } 

            var estado_solicitud = this.getView().byId("obj_estado_solicitud_vista_liq").getText();

            var ind_esta_borrado = false;
            if(estado_solicitud === "Borrado") {
                ind_esta_borrado = true;
            }

            if(ind_esta_borrado) {
                sap.m.MessageBox.information("No se puede liberar una liquidacion, de una solicitud ya borrada.");
                return;
            }

            try {
                const url =  v_url_ini + "/getLibLiq.php";  
                var item = this.getView().byId("idLiquidacionesTable").getSelectedItem();
                var objeto = item.getBindingContext("myParam").getObject();
                var v_sociedad = oModel.getProperty("/empresa_seleccionada"); 
                
                if(ind_conecta_json_sap == "1") {
                    let data = { 
                        SOCIEDAD: v_sociedad,
                        ID_LIQ: objeto.ID_LIQ
                    } 
                    dataRes = await this.f_ajax('POST', url, data, oModel.getProperty("/token")); 
                    this.f_limpiar_cabecera()
                     
                } else { 
                   dataRes = "Record deleted successfully"; 
                   this.f_limpiar_cabecera()
                }


                if(dataRes != undefined && dataRes[0] != undefined && dataRes[0].type != undefined && dataRes[0].type == "E") {
                    if(dataRes[0].MESSAGE == undefined){ MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor"); }
                    else { MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor (" + dataRes[0].MESSAGE + ")");  }
                    return;
                } else { 
                    //if(dataRes == "Record deleted successfully") { 
                        sap.m.MessageBox.information(`Acción realizada correctamente`);   
                        this.f_get_lista_solicitudes(); 
                        oModel.setProperty("/listaLiquidaciones", []); 
                      
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
        f_limpiar_cabecera: function() {
            this.getView().byId("obj_nro_solicitud_vista_liq").setText("");
            this.getView().byId("obj_fecha_sol_vista_liq").setText("");
            this.getView().byId("obj_solicitante_vista_liq").setText(""); 
            this.getView().byId("obj_sociedad_vista_liq").setText("");
            this.getView().byId("obj_tipo_solicitud_vista_liq").setText("");
            this.getView().byId("obj_estado_solicitud_vista_liq").setText("");
        },
        f_eliminar_liquidacion: async function() {
            var dataRes = null;
            var oModel = this.getView().getModel("myParam"); 
            var v_sociedad = oModel.getProperty("/empresa_seleccionada");

            var item = this.getView().byId("idLiquidacionesTable").getSelectedItem();
             
            if (!item) { 
                sap.m.MessageBox.information("Debe seleccionar 1 registro.");
                return;
            } 
            var estado_solicitud = this.getView().byId("obj_estado_solicitud_vista_liq").getText();

            var ind_esta_borrado = false;
            if(estado_solicitud === "Borrado") {
                ind_esta_borrado = true;
            }

            if(ind_esta_borrado) {
                sap.m.MessageBox.information("No se puede rechazar una liquidacion, de una solicitud ya borrada.");
                return;
            }

            try {
                const url = v_url_ini + "/postLiq.php";  
                var item = this.getView().byId("idLiquidacionesTable").getSelectedItem();
                var objeto = item.getBindingContext("myParam").getObject();
                 
                if(ind_conecta_json_sap == "1") {
                    let data = {
                        METHOD: "R", 
                        EST_LIQ: 'R',
                        ID_LIQ: objeto.ID_LIQ,
                        SOCIEDAD: v_sociedad
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
                        sap.m.MessageBox.information(`Liquidacion rechazada correctamente`);   
                        this.f_get_lista_solicitudes(); 
                        oModel.setProperty("/listaLiquidaciones", []); 
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
        f_get_lista_solicitudes: async function() {
            var dataRes = null;
            var urlAjax;
            var oModel = this.getView().getModel("myParam"); 
            var v_sociedad = oModel.getProperty("/empresa_seleccionada");
            
            try {
                urlAjax = v_url_ini +  `/getLibLiq.php?SOC=${v_sociedad}`
                console.log('urlAjax'); console.log(urlAjax);
                if(ind_conecta_json_sap == "1") {
                    dataRes = await this.f_ajax('GET', urlAjax, "", oModel.getProperty("/token"));     
                    //console.log('dataRes');
                    dataRes = JSON.parse(dataRes) 
                    //console.log(dataRes);      
                }
                else {
                    // Datos simulados si no hay conexión
                    dataRes = [{ 
                        "ID_LIQ": "LIQ001",
                        "ID_SOL": "001",
                        "DES_LIQ": "Desccr",
                        "EST_LIQ": "C",
                        "FEC_LIQ": "03/09/2024",
                        "SOCIEDAD": "1000",
                        "USR_AP_N1": "adlira",
                        "USR_AP_N2": "adlira",
                        "EST_LIB": "",
                        "USR_CREA": "",
                        "FEC_CREA": "",
                        "USR_MOD": "",
                        "FEC_MOD": "" 
                    },
                    { 
                        "ID_LIQ": "LIQ001",
                        "ID_SOL": "001",
                        "DES_LIQ": "Desccr",
                        "EST_LIQ": "C",
                        "FEC_LIQ": "03/09/2024",
                        "SOCIEDAD": "1000",
                        "USR_AP_N1": "adlira",
                        "USR_AP_N2": "adlira",
                        "EST_LIB": "",
                        "USR_CREA": "",
                        "FEC_CREA": "",
                        "USR_MOD": "",
                        "FEC_MOD": "" 
                    }
                ];
                }                                                                               
                if(dataRes != undefined && dataRes[0] != undefined && dataRes[0].type != undefined && dataRes[0].type == "E") {
                    if(dataRes[0].MESSAGE == undefined){ MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor"); }
                    else { MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor (" + dataRes[0].MESSAGE + ")");  }
                    return;
                } else {

                    //console.log("arraySinDuplicados", dataRes);

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


                    //console.log("arraySinDuplicados", arraySinDuplicados);
                    oModel.setProperty("/listaSolicitudes_distinct", arraySinDuplicados);
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
            //ID_SOL="4";
            var dataRes = null;
            var dataRes_ = null;

            var urlAjax;
            var oModel = this.getView().getModel("myParam");

            var v_usuario_login = oModel.getProperty("/usuario");       
            //console.log('v_usuario_login 11 '); console.log(v_usuario_login);

            try {
                dataRes = oModel.getProperty("/listaSolicitudes_pendientes_liberar_total");
                var dataRes_filtered = dataRes.filter(function(item) {
                    return item.ID_SOL == ID_SOL;  
                });


                for(var i = 0; i < dataRes_filtered.length; i++){
                    
                    dataRes_filtered[i].GEN_MONTO_LIQ = "0";
                    dataRes_filtered[i].GEN_MON_GTO = ""
                    urlAjax = v_url_ini + "/getDetLiq.php?USER=" + v_usuario_login +"&LIQ=" + dataRes_filtered[i].ID_LIQ;
                    //console.log('urlAjax'); console.log(urlAjax);
                    if(ind_conecta_json_sap == "1") {
                        dataRes = await this.f_ajax('GET', urlAjax, "", oModel.getProperty("/token"));
                        //console.log('dataRes'); console.log(dataRes);    
                        dataRes = JSON.parse(dataRes)
                    }
                    else {
                        // Datos simulados si no hay conexión
                        dataRes = {
                            "T_LIQ_DET":[
                                { "ID_LIQ":"2","POS_LIQ":"1","EST_GTO":"","FEC_GTO":"2024-10-10","ID_CONCEPTO":"6312","NIF_PROV":"12345678901","RAZ_PROV":"raz","PAIS_COMP":"PE","TIP_COMP":"01","NRO_COMP":"123-123123","IMP_GTO":"100.00","IMP_GTO_S":null,"MON_GTO":"PEN","MON_GTO_S":null,"IND_IVA":"C0","DESC_GTO":"123","ERP_OBJTYPE":"","ERP_OBJKEY":"","AREA":"","OBJ_CO":"1001","USR_CREA":"fsoto","FEC_CREA":"2024-10-11 01:04:53","USR_MOD":null,"FEC_MOD":null },
                                { "ID_LIQ":"3","POS_LIQ":"1","EST_GTO":"","FEC_GTO":"2024-10-11","ID_CONCEPTO":"6313","NIF_PROV":"12345678902","RAZ_PROV":"raz2","PAIS_COMP":"PE","TIP_COMP":"01","NRO_COMP":"123-123123","IMP_GTO":"110.00","IMP_GTO_S":null,"MON_GTO":"PEN","MON_GTO_S":null,"IND_IVA":"C0","DESC_GTO":"desc","ERP_OBJTYPE":"","ERP_OBJKEY":"","AREA":"","OBJ_CO":"1001","USR_CREA":"fsoto","FEC_CREA":"2024-10-11 01:04:53","USR_MOD":null,"FEC_MOD":null }
                            ]
                            //,
                            //"T_ADJ":[{"ID_ADJ":"181","ID_SOL":"2","ID_LIQ":"2","POS_LIQ":"1","DESC_ADJ":"","RUTA_ADJ":"","B64":"data:image\/jpeg;base64,\/9j\/4AAQSkZJRgABAQEAYABgAAD\/2wBDAAMCAgMCARRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAH\/\/Z"}]
                        };
                    }                                                                               
                    if(dataRes != undefined && dataRes[0] != undefined && dataRes[0].type != undefined && dataRes[0].type == "E") {
                        if(dataRes[0].MESSAGE == undefined){ MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor"); }
                        else { MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor (" + dataRes[0].MESSAGE + ")");  }
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
                        
                        dataRes_filtered[i].GEN_MON_GTO = dataRes.T_LIQ_DET[0].MON_GTO
                        dataRes_filtered[i].GEN_MONTO_LIQ = v_total_IMP_GTO;                        
                    } 
                }

                oModel.setProperty("/listaLiquidaciones", dataRes_filtered);  
                //console.log('selecciona las liquidaciones', dataRes_filtered);
                
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
        f_ver_liquidacion: async function(p_id_liq, p_id_sol) {
            var v_det_liq_det = null;
            var v_arr_datos_adjunto_cab = null;
            var dataRes = null;
            var urlAjax;
            
            var oModel = this.getView().getModel("myParam"); 
            var v_usuario_login = oModel.getProperty("/usuario");       
            //console.log('v_usuario_login 11 '); console.log(v_usuario_login);
            
            try {
                urlAjax = v_url_ini + "/getDetLiq.php?USER=" + v_usuario_login +"&LIQ=" + p_id_liq;
                console.log('urlAjax'); console.log(urlAjax);
                if(ind_conecta_json_sap == "1") {
                    dataRes = await this.f_ajax('GET', urlAjax, "", oModel.getProperty("/token"));
                    //console.log('dataRes'); console.log(dataRes);    
                    dataRes = JSON.parse(dataRes)
                }
                else {
                    // Datos simulados si no hay conexión
                    dataRes = {
                        "T_LIQ_DET":[
                            { "ID_LIQ":"2","POS_LIQ":"1","EST_GTO":"","FEC_GTO":"2024-10-10","ID_CONCEPTO":"6312","NIF_PROV":"12345678901","RAZ_PROV":"raz","PAIS_COMP":"PE","TIP_COMP":"01","NRO_COMP":"123-123123","IMP_GTO":"100.00","IMP_GTO_S":null,"MON_GTO":"PEN","MON_GTO_S":null,"IND_IVA":"C0","DESC_GTO":"123","ERP_OBJTYPE":"","ERP_OBJKEY":"","AREA":"","OBJ_CO":"1001","USR_CREA":"fsoto","FEC_CREA":"2024-10-11 01:04:53","USR_MOD":null,"FEC_MOD":null },
                            { "ID_LIQ":"3","POS_LIQ":"1","EST_GTO":"","FEC_GTO":"2024-10-11","ID_CONCEPTO":"6313","NIF_PROV":"12345678902","RAZ_PROV":"raz2","PAIS_COMP":"PE","TIP_COMP":"01","NRO_COMP":"123-123123","IMP_GTO":"110.00","IMP_GTO_S":null,"MON_GTO":"PEN","MON_GTO_S":null,"IND_IVA":"C0","DESC_GTO":"desc","ERP_OBJTYPE":"","ERP_OBJKEY":"","AREA":"","OBJ_CO":"1001","USR_CREA":"fsoto","FEC_CREA":"2024-10-11 01:04:53","USR_MOD":null,"FEC_MOD":null }
                        ]
                        //,
                        //"T_ADJ":[{"ID_ADJ":"181","ID_SOL":"2","ID_LIQ":"2","POS_LIQ":"1","DESC_ADJ":"","RUTA_ADJ":"","B64":"data:image\/jpeg;base64,\/9j\/4AAQSkZJRgABAQEAYABgAAD\/2wBDAAMCAgMCARRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAH\/\/Z"}]
                    };
                }                                                                               
                if(dataRes != undefined && dataRes[0] != undefined && dataRes[0].type != undefined && dataRes[0].type == "E") {
                    if(dataRes[0].MESSAGE == undefined){ MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor"); }
                    else { MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor (" + dataRes[0].MESSAGE + ")");  }
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
                    sap.ui.getCore().applyChanges();  
                    var oTable = sap.ui.core.Fragment.byId('DetalleLiquidacion',"table_detalle_liquidacion"); 
                    if (oTable) {
                        oTable.setHeaderText(`Lista detallada de gastos (${v_total_IMP_GTO.toFixed(2)})`); 
                        sap.ui.getCore().applyChanges(); 
                    }

                    v_det_liq_det = dataRes.T_LIQ_DET;
                    //v_arr_datos_adjunto_cab = dataRes.T_ADJ;
                    v_arr_datos_adjunto_cab = await this.f_get_det_adj(p_id_sol);
                 
                    for (var i = 0; i < v_det_liq_det.length; i++) {
                        v_det_liq_det[i].visible_ADJ = false;

                        if(v_arr_datos_adjunto_cab != undefined && v_arr_datos_adjunto_cab != "") {
                            for(var j = 0; j < v_arr_datos_adjunto_cab.length; j++) {
                                if( v_det_liq_det[i].ID_LIQ == v_arr_datos_adjunto_cab[j].ID_LIQ && v_det_liq_det[i].POS_LIQ == v_arr_datos_adjunto_cab[j].POS_LIQ  && v_arr_datos_adjunto_cab[j].B64 != undefined && v_arr_datos_adjunto_cab[j].B64 != "") {
                                    v_det_liq_det[i].B64 = v_arr_datos_adjunto_cab[j].B64;
                                    v_det_liq_det[i].DESC_ADJ = v_arr_datos_adjunto_cab[j].DESC_ADJ;    
                                    v_det_liq_det[i].visible_ADJ = true;
                                }
                            }
                        }
                    }      

                    oModel.setProperty("/listaDetalleLiquidacion", v_det_liq_det);
                    //console.log(this.getView().getModel("myParam").getProperty("/listaDetalleLiquidacion"));
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
            }
        },
        f_get_det_adj: async function(p_id_sol) {
            var dataRes = null;
            var oModel = this.getView().getModel("myParam");
            var v_url = ""; 

            //var v_data_liq_cab;
            //var v_data_ord_cab;
            //var v_data_sol_cab;
            var v_data_adj_cab;

            var v_sociedad = oModel.getProperty("/empresa_seleccionada"); 

            try {
            
                v_url = v_url_ini + "/" + `getDetSol.php?USER=adlira&SOC=${v_sociedad}&SOL=${p_id_sol}`; 
 
                if(ind_conecta_json_sap == "1") {
                    dataRes = await this.f_ajax('GET', v_url, '', oModel.getProperty("/token"));
                    if(dataRes != undefined)   {
                        dataRes = JSON.parse(dataRes);
                        if (dataRes.T_LIQ != undefined && dataRes.T_ORD != undefined) {
                            //v_data_liq_cab = dataRes.T_LIQ;
                            //v_data_ord_cab = dataRes.T_ORD;
                            //v_data_sol_cab = dataRes.T_SOL;
                            v_data_adj_cab = dataRes.T_ADJ;
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
                    //v_data_liq_cab = [{"ID_LIQ":"2","ID_SOL":"2","DES_LIQ":"Liq 2","EST_LIQ":"X","FEC_LIQ":"2024-08-29","SOCIEDAD":"1000","USR_AP_N1":"JCLIRA","USR_AP_N2":"ADLIRA","EST_LIB":"XX","USR_CREA":"adlira","FEC_CREA":"2024-08-2907:13:43"}];
                    //v_data_ord_cab = [{"ID_ORD":"29","ID_SOL":"34","DES_ORD":"sol","EST_ORD":"L","FEC_ORD":"2024-09-24","IMP_ORD":"111.00","MON_ORD":"PEN","SOCIEDAD":"1000","USR_AP_N1":"JCLIRA","USR_AP_N2":"ADLIRA","EST_LIB":"XX","ERP_OBJTYPE":null,"ERP_OBJKEY":null,"USR_CREA":"jclira","FEC_CREA":"2024-10-05 17:52:13","USR_MOD":null,"FEC_MOD":null}];
                    //v_data_sol_cab = [{"ID_SOL":"2","TIP_SOL":"CCH","FEC_SOL":"2024-08-29","EST_SOL":"B","MOT_SOL":"Solicitud 02","SOCIEDAD":"1000","USR_CREA":"adlira","FEC_CREA":"2024-08-29 05:30:44","USR_MOD":null,"FEC_MOD":null,"USR_SOL":"jclira"}];
                    v_data_adj_cab = [{"ID_ADJ":"181","ID_SOL":"2","ID_LIQ":"2","POS_LIQ":"1","DESC_ADJ":"","RUTA_ADJ":"","B64":"data:image\/jpeg;base64,\/9j\/4AAQSkZJRgABAQEAYABgAAD\/2wBDAAMCAgMCARRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAH\/\/Z"}]
                }
                 
                if(dataRes != undefined && dataRes[0] != undefined && dataRes[0].type != undefined && dataRes[0].type == "E") {
                    if(dataRes[0].MESSAGE == undefined){ MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor"); }
                    else { MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor (" + dataRes[0].MESSAGE + ")");  }
                    return;
                } else {
                    //oModel.setProperty("/lista_liquidacion_cab", v_data_liq_cab); 
                    //oModel.setProperty("/lista_ord_cab", v_data_ord_cab); 
                    //oModel.setProperty("/solicitud_selected_cab", v_data_sol_cab); 
                    //oModel.setProperty("/lista_adj_cab", v_data_adj_cab); 

                    return v_data_adj_cab;
                }
            } catch(error) {
                BusyIndicator.hide(); 
                console.log('error');
                console.log(error);
                //obtiene solo documentos, si no obtiene retorna vacio y muestra el error
                return "";
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

            if(!v_base64_local) {
                v_base64_descarga = v_base64_adj_web;
            }
            else {
                v_base64_descarga = v_base64_local;
            }

            /*
            // Detectar el tipo MIME desde el Base64 si tiene el prefijo 'data:image/jpeg;base64,'
            var mimeRegex = /^data:(.+);base64,/;
            var match = sBase64.match(mimeRegex);
            var sMimeType = "application/octet-stream";  // Tipo MIME predeterminado
            var sExtension = "";  // Variable para la extensión del archivo

            if (match) {
                sMimeType = match[1];  // Extraer el tipo MIME del Base64
                sBase64 = sBase64.replace(mimeRegex, '');  // Remover el prefijo de la cadena Base64

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
            //link.href = "data:" + sMimeType + ";base64," + sBase64;
            link.href = "data:application/octet-stream;base64," + v_base64_descarga;
            //link.download = sFileName;
            link.download = v_nombre_fichero;
            link.click();

            // Limpieza
            link.remove();

        },
        f_dialog_show: function(idDialog, namespace, title= 'Formulario') { 
            var oView = this.getView(); 

            //Realiza la apertura del fragment-----------
            if (this.ogDialog) { this.ogDialog.destroy(); }; 
            this.ogDialog = sap.ui.xmlfragment(`${idDialog}`, `nsnew.uisemnew.view.fragments.${namespace}`, this) 
            oView.addDependent(this.ogDialog);
            this.ogDialog.setTitle(`${title}`);
            
            this.ogDialog.open();
            //this.dialog_data(type, oData, p_idDialog);
            //--------------------------------------------
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
                
            var oTable = this.byId("idLiquidacionesTable"); // Referencia a la tabla de liquidaciones
            var aSelectedItems = oTable.getSelectedItems(); // Obtener los elementos seleccionados
            if (aSelectedItems.length == 0) {
                sap.m.MessageBox.information("Seleccione  una liquidación para procesar.");
                return;
            }
            aSelectedItems.forEach(function(oSelectedItem) {
                var oContext = oSelectedItem.getBindingContext("myParam");
                var sIdLiq = oContext.getProperty("ID_LIQ");
                var oPayload = { "METHOD": sMethod, "ID_LIQ": sIdLiq };
                this.f_liberar_liquidacion(oPayload);
            }.bind(this));  
        },    
        f_format_monto: function (sValue) {
            if (sValue) {
                // Convert to float
                var fValue = parseFloat(sValue);
                if (!isNaN(fValue)) {
                    // Apply currency format (you can adjust the format as needed)
                    return fValue.toFixed(2); // Example: format as float with 2 decimals
                }
            }
            return sValue; // In case the value is empty or invalid, return the original value
        }
    });
});