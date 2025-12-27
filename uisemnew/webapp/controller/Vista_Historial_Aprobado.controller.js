sap.ui.define([ 
    "sap/ui/core/mvc/Controller", 
    "sap/ui/core/BusyIndicator",
    "sap/m/MessageToast",
    "sap/ui/core/util/Export",
    "sap/ui/core/util/ExportTypeCSV",
    "sap/ui/export/Spreadsheet",
    "sap/m/MessageBox",

], function (Controller, BusyIndicator, MessageToast, Export, ExportTypeCSV, Spreadsheet,MessageBox) {
    "use strict";

    var ind_conecta_json_sap = "1";
    var v_url_ini = "/cpblcase";
    
    return Controller.extend("nsnew.uisemnew.controller.Vista_Historial_Aprobado", {
        onInit: function () {
            this.getRouter().getRoute("Vista_Historial_Aprobado").attachMatched(this._onRouteMatched, this); 

            const v_fecha7dias = new Date();
            let fecha = new Date()
            v_fecha7dias.setDate(v_fecha7dias.getDate() - 7);
            this.byId("txt_fecha_desde").setValue(v_fecha7dias.toISOString().split('T')[0]);
            this.byId("txt_fecha_hasta").setValue(fecha.toISOString().split('T')[0]);
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
            //this.f_get_lista_anticipo() 
            this.f_get_lista_liquidaciones() 
            //this.f_get_det_sol_liq_ord(); 
        },
        f_logout: function () {
            window.location.replace('./logout');
        },
        getRouter: function () { return sap.ui.core.UIComponent.getRouterFor(this); },
        pressVolver: function () {
            this.getRouter().navTo("Vista_Menu_Principal");
        },
        f_filtrar_historial: function (oEvent) {
            var arr_filter = [];
            var v_texto = oEvent.getSource().getValue();
            if (v_texto && v_texto.length > 0) {
                var v_filter = new sap.ui.model.Filter("FEC_LIB", sap.ui.model.FilterOperator.Contains, v_texto);
                arr_filter.push(v_filter); 
                this.byId("historialAprobacionesLiquidacion").getBinding("items").filter(arr_filter);
            } else {
                this.byId("historialAprobacionesLiquidacion").getBinding("items").filter([]);
            } 
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
        f_get_det_sol_liq_ord: async function(ID_SOL) {
            var dataRes = null;
            var oModel = this.getView().getModel("myParam");
            var v_url = ""; 

            var v_data_liq_cab;
            var v_data_ord_cab;
            var v_data_sol_cab;
            var v_data_adj_cab;
            
            try { 
                var v_sociedad = oModel.getProperty("/empresa_seleccionada");  
   
                v_url = v_url_ini+"/"+`getDetSol.php?USER=adlira&SOC=${v_sociedad}&SOL=${ID_SOL}`; 
 
                if(ind_conecta_json_sap == "1") {
                    dataRes = await this.f_ajax('GET', v_url, '', oModel.getProperty("/token"));
                    if(dataRes != undefined)   {
                        dataRes = JSON.parse(dataRes);
                        if (dataRes.T_LIQ != undefined && dataRes.T_ORD != undefined) {
                            v_data_liq_cab = dataRes.T_LIQ;
                            v_data_ord_cab = dataRes.T_ORD;
                            v_data_sol_cab = dataRes.T_SOL;
                            v_data_adj_cab = dataRes.T_ADJ;

                            v_data_liq_cab = v_data_liq_cab.filter(item => 
                                ["C", "V", "L"].includes(item.EST_LIQ)
                            );
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
                    v_data_liq_cab = [];
                    v_data_liq_cab = v_data_liq_cab.filter(item => 
                        ["C", "V", "L"].includes(item.EST_LIQ)
                    ); 
                    v_data_ord_cab = [{"ID_ORD":"29","ID_SOL":"2","DES_ORD":"sol","EST_ORD":"P","FEC_ORD":"2024-09-24","IMP_ORD":"111.00","MON_ORD":"PEN","SOCIEDAD":"1000","USR_AP_N1":"JCLIRA","USR_AP_N2":"ADLIRA","EST_LIB":"XX","ERP_OBJTYPE":null,"ERP_OBJKEY":null,"USR_CREA":"jclira","FEC_CREA":"2024-10-05 17:52:13","USR_MOD":null,"FEC_MOD":null}];
                    v_data_sol_cab = [{"ID_SOL":"2","TIP_SOL":"CCH","FEC_SOL":"2024-08-29","EST_SOL":"B","MOT_SOL":"Solicitud 02","SOCIEDAD":"1000","USR_CREA":"adlira","FEC_CREA":"2024-08-29 05:30:44","USR_MOD":null,"FEC_MOD":null,"USR_SOL":"jclira"}];
                    v_data_adj_cab = [{"ID_ADJ":"181","ID_SOL":"2","ID_LIQ":"2","POS_LIQ":"1","DESC_ADJ":"","RUTA_ADJ":"","B64":"data:image\/jpeg;base64,\/9j\/4AAQSkZJRgABAQEAYABgAAD\/2wBDAAMCAgMCARRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAH\/\/Z"}]
                }
                 
                if(dataRes != undefined && dataRes[0] != undefined && dataRes[0].type != undefined && dataRes[0].type == "E") {
                    if(dataRes[0].MESSAGE == undefined){ MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor"); }
                    else { MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor (" + dataRes[0].MESSAGE + ")");  }
                    return;
                } else {
                    oModel.setProperty("/lista_liquidacion_cab", v_data_liq_cab); 
                    oModel.setProperty("/lista_ord_cab", v_data_ord_cab); 
                    oModel.setProperty("/solicitud_selected_cab", v_data_sol_cab); 
                    oModel.setProperty("/lista_adj_cab", v_data_adj_cab);                   
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
        f_get_lista_anticipo: async function() {
            var dataRes = null;
            var urlAjax;
            var oModel = this.getView().getModel("myParam"); 
            
            try {
                urlAjax = v_url_ini + `/getHistLib.php`;
                
                if(ind_conecta_json_sap == "1") {
                    BusyIndicator.show(0);
                    let data = "";
                    dataRes = await this.f_ajax('GET', urlAjax, data, oModel.getProperty("/token"));
                    BusyIndicator.hide();
                    dataRes = JSON.parse(dataRes) 
 
                    //console.log('dadaaaaaaaaaaaaaaaaaaaaaaaaaaa', dataRes); 
                    const arraySinDuplicados = dataRes.reduce((acumulador, item) => { 
                        if (!acumulador.some(obj => obj.ID_SOL === item.ID_SOL)) {
                            acumulador.push(item);  
                        }
                        return acumulador;
                    }, []);
                }
                else {
                    // Datos simulados si no hay conexión
                    dataRes = [];
                }                                                                               
                if(dataRes != undefined && dataRes[0] != undefined && dataRes[0].type != undefined && dataRes[0].type == "E") {
                    if(dataRes[0].MESSAGE == undefined){ MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor"); }
                    else { MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor (" + dataRes[0].MESSAGE + ")");  }
                    return;
                } else {
                    oModel.setProperty("/historialAprobacionesAnticipo", dataRes); 
                }  
            } catch(error) {
                BusyIndicator.hide();  
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
        f_get_lista_liquidaciones: async function() {
            var dataRes = null;
            var urlAjax, status, response;
            var oModel = this.getView().getModel("myParam"); 

            var cmb_tipo = this.byId("cmb_tipo").getSelectedKey();
            var v_fecha_inicio = this.byId("txt_fecha_desde").getValue();
            var v_fecha_fin = this.byId("txt_fecha_hasta").getValue();

            if(v_fecha_inicio == undefined ||  v_fecha_inicio == "" || v_fecha_inicio.length != 10) {
                MessageToast.show("Por favor, valide la fecha de inicio"); 
                return;
            }

            if(v_fecha_fin == undefined ||  v_fecha_fin == "" || v_fecha_fin.length != 10) {
                MessageToast.show("Por favor, valide la fecha de fin"); 
                return;
            }
            
            try {
                urlAjax = v_url_ini + "/getHistLib.php" + "?FecD=" + v_fecha_inicio + "&FecH=" + v_fecha_fin + "&TIP=" + cmb_tipo
                console.log('urlAjax'); 
                if(ind_conecta_json_sap === "1") {
                    BusyIndicator.show(0);
                    let data = "";
                    dataRes = await this.f_ajax('GET', urlAjax, data, oModel.getProperty("/token"));
                 
                    BusyIndicator.hide();
                    dataRes = JSON.parse(dataRes) 
                    //console.log("dataRes", dataRes);
                }
                else { 
                    dataRes = [
                        {
                            "ID_HIST_LIB": "3",
                            "TIPO_REF": "L",
                            "ID_LIQ": "230",
                            "ID_SOL": "2",
                            "USERNAME": "Julio Pari",
                            "FEC_LIB": "2024-11-12",
                            "USR_LIB": "jclira"
                        },
                        {
                            "ID_HIST_LIB": "3",
                            "TIPO_REF": "L",
                            "ID_LIQ": "230",
                            "ID_SOL": "2",
                            "USERNAME": "Julio Pari",
                            "FEC_LIB": "2024-11-12",
                            "USR_LIB": "jclira"
                        },
                        {
                            "ID_HIST_LIB": "3",
                            "TIPO_REF": "L",
                            "ID_LIQ": "230",
                            "ID_SOL": "2",
                            "USERNAME": "Julio Pari",
                            "FEC_LIB": "2024-11-12",
                            "USR_LIB": "jclira"
                        }
                    ];
                }                                                                               
                if(dataRes != undefined && dataRes[0] != undefined && dataRes[0].type != undefined && dataRes[0].type == "E") {
                    if(dataRes[0].MESSAGE == undefined) { MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor"); }
                    else { MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor (" + dataRes[0].MESSAGE + ")");  }
                    return;
                } else {
                    

                    var v_tipo_lib_desc = "";
                    for(var i = 0; i < dataRes.length; i++) {
                        if(dataRes[i].TIPO_LIB == "R") {  
                            v_tipo_lib_desc = "Rechazado"; 
                        } 
                        else { 
                            v_tipo_lib_desc = "Aprobado"; 
                        }

                        if(dataRes[i].TIPO_REF == "O") {  
                            dataRes[i].GEN_ID_LIQ = v_tipo_lib_desc + " Nro Ant.: " + dataRes[i].ID_LIQ;  
                        }
                        else {  
                            dataRes[i].GEN_ID_LIQ = v_tipo_lib_desc + " Nro Liq.: " + dataRes[i].ID_LIQ;  
                        }
                    }
                    
                    oModel.setProperty("/historialAprobacionesLiquidacion", dataRes);
                    
                    /*
                    var fechaInicio = this.byId("txt_fecha_desde").getValue();
                    var fechaFin = this.byId("txt_fecha_hasta").getValue();

                    //var oModel = this.getView().getModel("myParam"); 
        
                    // Filtrar los datos dentro del rango
        
                    //let data = oModel.getProperty("/historialAprobacionesLiquidacion"); 
                
                    const eventosFiltrados = dataRes.filter(evento => { 
                        const fechaEvento = new Date(evento.FEC_LIB); 
                        return fechaEvento >= new Date(fechaInicio) && fechaEvento <= new Date(fechaFin);
                    });
                    console.log(eventosFiltrados);
                    oModel.setProperty("/historialAprobacionesLiquidacion", eventosFiltrados); 
                    */
 
                    return;
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
        f_press_anticipo_excel:   function() {
            var items =   this.getView().byId("idTablaAnticipo").getItems(); 
            var m; 
            var data = []; 
            for (var i = 0; i < items.length; i++) {
                let item = {}; 
                m = items[i].getBindingContext("myParam").getObject(); 
                item.ID_SOL = m.ID_SOL;
                item.TIP_SOL = m.TIP_SOL;
                item.DES_ORD = m.DES_ORD; 
                item.FEC_ORD = m.FEC_ORD;
                item.IMP_ORD = m.IMP_ORD;
                item.MON_ORD = m.MON_ORD;
                item.SOCIEDAD = m.SOCIEDAD;
                item.USR_AP_N1 = m.USR_AP_N1;
                item.USR_AP_N2 = m.USR_AP_N2;
                item.EST_ORD = m.EST_ORD;   
                data.push(item);
            } 
            this.getView().getModel("myParam").setProperty('/anticipoExcel', data); 
            var aProducts, oSettings, oSheet;

            var aCols = [];
            aCols.push({ label: 'Tipo anticipo', property: 'TIP_SOL', type: 'string' });
            aCols.push({ label: 'Descripción', property: 'DES_ORD', type: 'string' }); 
            aCols.push({ label: 'Fecha Anticipo', property: 'FEC_ORD', type: 'string' });
            aCols.push({ label: 'Importe', property: 'IMP_ORD', type: 'string' });
            aCols.push({ label: 'Moneda', property: 'MON_ORD', type: 'string' });
            aCols.push({ label: 'Sociedad', property: 'SOCIEDAD', type: 'string' });
            aCols.push({ label: 'Usuario creador', property: 'USR_AP_N1', type: 'string' });
            aCols.push({ label: 'Usuario aprobador', property: 'USR_AP_N2', type: 'string' });
            aCols.push({ label: 'Estado', property: 'EST_ORD', type: 'string' }); 

            aProducts = this.getView().getModel("myParam").getProperty('/anticipoExcel');
            
            oSettings = {
                workbook: { columns: aCols },
                dataSource: data,
                fileName: "ReporteAnticipo.xlsx"
            }; 
            oSheet = new Spreadsheet(oSettings);
            oSheet.build()
                .then(function () {
                    this.getView().setBusy(false);
                    sap.m.MessageBox.information("Se realizó la exportación del reporte con éxito.");
                }.bind(this))
                .finally(function () {
                    this.getView().setBusy(false);
                    oSheet.destroy();
                }.bind(this));        
        },  
        f_press_liquidacion_excel: function() {
            var items =   this.getView().byId("idTablaLiquidacion").getItems(); 
            var m; 
            var data = []; 
            for (var i = 0; i < items.length; i++) {
                let item = {}; 
                m = items[i].getBindingContext("myParam").getObject();

                var v_tipo_lib_desc = ""; 
                if(m.TIPO_LIB == "R") {  
                    v_tipo_lib_desc = "Rechazado"; 
                } else { 
                    v_tipo_lib_desc = "Aprobado"; 
                }
 
                item.ID_SOL = m.ID_SOL;
                item.ID_LIQ = m.ID_LIQ;
                item.ID_HIST_LIB = m.ID_HIST_LIB;
                item.FEC_LIB = m.FEC_LIB;  
                item.TIPO_LIB = v_tipo_lib_desc;
                item.TIP_SOL = m.TIP_SOL;
                item.USERNAME = m.USERNAME;
                item.USR_LIB = m.USR_LIB;
                data.push(item);
            }
            

            this.getView().getModel("myParam").setProperty('/liquidacionExcel', data); 
            var aProducts, oSettings, oSheet;

            var aCols = [];
            aCols.push({ label: 'Id Solicitud', property: 'ID_SOL', type: 'string' }); 
            aCols.push({ label: 'Id Liquidacion', property: 'ID_LIQ', type: 'string' });
            aCols.push({ label: 'Historial Liberacion', property: 'ID_HIST_LIB', type: 'string' }); 
            aCols.push({ label: 'Fecha Liberación', property: 'FEC_LIB', type: 'string' });  
            aCols.push({ label: 'Tipo Liberacion', property: 'TIPO_LIB', type: 'string' }); 
            aCols.push({ label: 'Tipo Solicitud', property: 'TIP_SOL', type: 'string', });  
            aCols.push({ label: 'Nombre de Usuario', property: 'USERNAME', type: 'string' }); 
            aCols.push({ label: 'Usuario Liberador', property: 'USR_LIB', type: 'string' });

            aProducts = this.getView().getModel("myParam").getProperty('/liquidacionExcel');
            
            oSettings = {
                workbook: { columns: aCols },
                dataSource: data,
                fileName: "ReporteLiquidacion.xlsx"
            }; 
            oSheet = new Spreadsheet(oSettings);
            oSheet.build()
                .then(function () {
                    this.getView().setBusy(false);
                    sap.m.MessageBox.information("Se realizó la exportación del reporte con éxito.");
                }.bind(this))
                .finally(function () {
                    this.getView().setBusy(false);
                    oSheet.destroy();
                }.bind(this));        
        }, 
        f_tipo_imagen_solicitud: function(TIP_SOL) {
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
                    break;
            }
            return p_image_tipo;
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
        onSearchAnticipo: function (oEvt) {
            var aFilters = [];
            var aFiltersG = [];
            var realizarFiltro = true;
            var sQuery = oEvt.getSource().getValue();
            var list = this.byId("idTablaAnticipo");
            var binding = list.getBinding("items");
            if (sQuery && sQuery.length > 0) {
                var filter = new sap.ui.model.Filter("ID_ORD", sap.ui.model.FilterOperator.Contains, sQuery);
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
        onSearchLiquidacion: function (oEvt) {
            var aFilters = [];
            var aFiltersG = [];
            var realizarFiltro = true;
            var sQuery = oEvt.getSource().getValue();
            var list = this.byId("idTablaLiquidacion");
            var binding = list.getBinding("items");
            if (sQuery && sQuery.length > 0) {
                var filter = new sap.ui.model.Filter("FEC_LIB", sap.ui.model.FilterOperator.Contains, sQuery);
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
    });
});