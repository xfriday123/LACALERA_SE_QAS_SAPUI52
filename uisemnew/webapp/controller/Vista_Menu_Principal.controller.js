sap.ui.define([
    "sap/ui/core/mvc/Controller",    
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/BusyIndicator"
],
function (Controller, MessageToast, MessageBox, BusyIndicator) {
    "use strict";
    var ind_conecta_json_sap = "1";
    var v_url_ini = "/cpblcase";
        
    return Controller.extend("nsnew.uisemnew.controller.Vista_Menu_Principal", {
        onInit: function () {
            console.log("oninit");
        },
        onRouteMatched: function () {
            console.log("onroutematched");
            var that = this

            BusyIndicator.show(0);
            setTimeout(function() {
                that.f_get_datos_maestros();
                //that.f_get_datos_maestros_admin();
                BusyIndicator.hide();
            }, 1000);  // 1000 milisegundos = 1 segundo
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
        onAfterRendering: function(){
            console.log("onAfterRendering llama route");    
            this.onRouteMatched();        
        },
        f_open_ayuda: function () {
            var oDialog = this.byId("ayudaDialog");

            if (!oDialog) {
                console.log("Dialog no encontrado.");
                return;
            }

            var sUrl = "../botpopup.html";  // Reemplaza con la URL de tu página externa
            var oIframe = oDialog.$().find('iframe')[0];
            
            if (oIframe) {
                oIframe.src = sUrl;
            } else {
                console.log("iframe no encontrado.");
            }
            oDialog.open();
        },
        onCloseDialog: function () {
            this.byId("ayudaDialog").close();
        },
        f_change_lista_empresa: function () {
            var oModel = this.getView().getModel("myParam");
            var v_empresa_seleccionada = this.getView().byId("cmb_lista_empresa_seleccionable").getSelectedKey();
            //console.log("v_empresa_seleccionada", v_empresa_seleccionada);
            oModel.setProperty("/empresa_seleccionada", v_empresa_seleccionada);

            this.f_get_datos_maestros_de_sociedad();
        },
        f_get_datos_maestros_de_sociedad: async function() {
            console.log("datos_maestros_de_sociedad_seleccionada");
            var oModel = this.getView().getModel("myParam");
            var v_url = "";
            var v_empresa_seleccionada = "";
            var dataRes;
            var T_AREA;
            var T_CONCEPTO;
            var T_OBJ_CO;
            var T_PAIS;
            var T_TIP_NOTA;
            var T_TIP_COMP;
            var T_CON_CTA;

            try {
                v_empresa_seleccionada = this.getView().byId("cmb_lista_empresa_seleccionable").getSelectedKey();
                v_url = v_url_ini + `/getDM.php?SOC=${v_empresa_seleccionada}`; 
                if(ind_conecta_json_sap === "1") {
                    dataRes = await this.f_ajax('GET', v_url, '', oModel.getProperty("/token"));
                    if(dataRes != undefined) {
                        dataRes = JSON.parse(dataRes);
                        if (dataRes.T_AREA != undefined) { 
                            T_AREA     = dataRes.T_AREA;
                            T_CONCEPTO = dataRes.T_CONCEPTO;
                            T_OBJ_CO   = dataRes.T_OBJ_CO;
                            T_PAIS     = dataRes.T_PAIS;
                            T_TIP_NOTA = dataRes.T_TIP_NOTA;
                            T_TIP_COMP = dataRes.T_TIP_COMP;
                            T_CON_CTA  = dataRes.T_CON_CTA; 
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
                    dataRes ={"T_AREA":[{"AREA":"1000000001","DESC_AREA":"Log\u00edstica","OBJ_CO":"1001"},{"AREA":"1000000002","DESC_AREA":"Marketing","OBJ_CO":"1002"},{"AREA":"1000000003","DESC_AREA":"Contabilidad","OBJ_CO":"1001"}],"T_CONCEPTO":[{"ID_CONCEPTO":"6311","DES_CONCEPTO":"Transporte"},{"ID_CONCEPTO":"6312","DES_CONCEPTO":"Correos"},{"ID_CONCEPTO":"6313","DES_CONCEPTO":"Alojamiento"},{"ID_CONCEPTO":"6314","DES_CONCEPTO":"Alimentaci\u00f3n"},{"ID_CONCEPTO":"6315","DES_CONCEPTO":"Otros gastos de viaje"}],
                    "T_OBJ_CO":[
                        {"OBJ_CO":"1001","DESC_OBJ_CO":"CECO 1","TIPO_OBJ":null},
                        {"OBJ_CO":"1002","DESC_OBJ_CO":"CECO 2","TIPO_OBJ":null}
                    ],"T_PAIS":[{"ID_PAIS":"PE","DESC_PAIS":"Per\u00fa"}],"T_TIP_NOTA":[{"ID_TIP_NOTA":"AP","DESC_TIP_NOTA":"Aprobaci\u00f3n"},{"ID_TIP_NOTA":"RE","DESC_TIP_NOTA":"Rechazo"}],"T_TIP_COMP":[{"PAIS":"PE","TIP_COMP":"01","DESC_COMP":"Factura"},{"PAIS":"PE","TIP_COMP":"03","DESC_COMP":"Boleta"}],"T_CON_CTA":[]}
                    //console.log('dataRes1');
                    //console.log(dataRes);
                    T_AREA     = dataRes.T_AREA;
                    T_CONCEPTO = dataRes.T_CONCEPTO;
                    T_OBJ_CO   = dataRes.T_OBJ_CO;
                    T_PAIS     = dataRes.T_PAIS;
                    T_TIP_NOTA = dataRes.T_TIP_NOTA;
                    T_TIP_COMP = dataRes.T_TIP_COMP;
                    T_CON_CTA  = dataRes.T_CON_CTA; 
                }    

                if(dataRes != undefined && dataRes[0] != undefined && dataRes[0].type != undefined && dataRes[0].type == "E") {
                    if(dataRes[0].MESSAGE == undefined){ MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor"); }
                    else { MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor (" + dataRes[0].MESSAGE + ")");  }
                    return;
                } else{

                    //añade concepto vacio si no existiera----
                    var ind_existe_vacio = T_CONCEPTO.some(function(concepto) {
                        return concepto.ID_CONCEPTO == "";
                    });
                    if (!ind_existe_vacio) {
                        var obj_vacio = { "ID_CONCEPTO": "", "DES_CONCEPTO": "Seleccionar"  };
                        T_CONCEPTO.push(obj_vacio);
                    }
                     
                    var obj_vacio_ = { "OBJ_CO": "", "DESC_OBJ_CO": "Seleccionar" };
                    T_OBJ_CO.push(obj_vacio_);
                
                    //----------------------------------------

                    oModel.setProperty("/T_AREA", T_AREA); 
                    oModel.setProperty("/T_CONCEPTO", T_CONCEPTO);          
                    oModel.setProperty("/T_OBJ_CO", T_OBJ_CO);          
                    oModel.setProperty("/T_PAIS", T_PAIS);          
                    oModel.setProperty("/T_TIP_NOTA", T_TIP_NOTA);          
                    oModel.setProperty("/T_TIP_COMP", T_TIP_COMP);          
                    oModel.setProperty("/T_CON_CTA", T_CON_CTA);   
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
        f_get_datos_maestros: async function() {
            console.log("f_get_datos_maestros");
            var dataRes = null;
            var dataUser = null;
            var oModel = this.getView().getModel("myParam");
            var v_url = "";

            try {

                 //console.log(oModel.getProperty("/token"));

                /* obtiene lista de empresas */
                v_url = v_url_ini + "/getDM.php"; 
                if(ind_conecta_json_sap == "1") {
                    dataRes = await this.f_ajax('GET', v_url, '', oModel.getProperty("/token"));
                    if(dataRes != undefined)   {
                        dataRes = JSON.parse(dataRes);
                        if (dataRes.T_SOCIEDAD != undefined) { 
                            dataRes = dataRes.T_SOCIEDAD;
                            //dataUser = dataRes.USER;
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
                    dataRes = [{"SOCIEDAD": "ZZ", "DESC_SOC":"ZZ"}, {"SOCIEDAD": "1000", "DESC_SOC":"Not C"}, {"SOCIEDAD": "1001", "DESC_SOC":"Not"}];
                }    

                if(dataRes != undefined && dataRes[0] != undefined && dataRes[0].type != undefined && dataRes[0].type == "E") {
                    if(dataRes[0].MESSAGE == undefined){ MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor"); }
                    else { MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor (" + dataRes[0].MESSAGE + ")");  }
                    return;
                } else{
                    //filtra empresas que no debe aparecer como la 1000, no irá st cambio
                    //dataRes = dataRes.filter(empresa => empresa.SOCIEDAD != "1000");

                    oModel.setProperty("/lista_empresas_ruc", dataRes);
                    this.getView().byId("cmb_lista_empresa_seleccionable").setSelectedKey(dataRes[0].SOCIEDAD);
                    //oModel.setProperty("/nombre_usuario", dataUser)
                    this.f_change_lista_empresa()

                }




                //obtiene admindata
                v_url = v_url_ini + "/getAdminData.php"; 
                //console.log('v_url'); console.log(v_url);
                if(ind_conecta_json_sap === "1") {
                    BusyIndicator.show(0);
                    let data = "";
                    dataRes = await this.f_ajax('GET', v_url, data, oModel.getProperty("/token"));
                    BusyIndicator.hide();
                    dataRes = JSON.parse(dataRes);
                    //console.log('dataRes'); console.log(dataRes);    
                }
                else {
                    // Simulación de datos si no hay conexión
                    dataRes = { 
                    }
                }

                if(dataRes != undefined && dataRes[0] != undefined && dataRes[0].type != undefined && dataRes[0].type == "E") {
                    if(dataRes[0].MESSAGE == undefined){ MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor"); }
                    else { MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor (" + dataRes[0].MESSAGE + ")");  }
                    return;
                } 
                else {                         
                    dataRes = dataRes.T_VALIDACION; 
                    oModel.setProperty("/listaGrupoActivacion", dataRes);
                } 


                

                /* obtiene datos autorizacion */
                /*
                v_url = v_url_ini + "/getDM.php"; 
                if(ind_conecta_json_sap == "1") {
                    dataRes = await this.f_ajax('GET', v_url, '', oModel.getProperty("/token"));
                    if(dataRes != undefined)   {
                        dataRes = JSON.parse(dataRes);
                        if (dataRes.T_SOCIEDAD != undefined) { 
                            dataRes = dataRes.T_SOCIEDAD;
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
                    dataRes = [{"SOCIEDAD": "XX", "GPO_AUT":"XX", "TIPO": "XX", "FUNC_APP": "XX"}];
                }    

                if(dataRes != undefined && dataRes[0] != undefined && dataRes[0].type != undefined && dataRes[0].type == "E") {
                    if(dataRes[0].MESSAGE == undefined){ MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor"); }
                    else { MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor (" + dataRes[0].MESSAGE + ")");  }
                    return;
                } else{
                    oModel.setProperty("/lista_autorizacion", dataRes);
                    return;
                }  
                */

                
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
        /*f_get_datos_maestros_admin: async function() {
            var dataRes = null; 
            var dataRes_Concepto = null; 
            var dataRes_T_Val = null;
            var urlAjax;
            
            var oModel = this.getView().getModel("myParam"); 
            var v_sociedad = oModel.getProperty("/empresa_seleccionada");
            
            try {
                //urlAjax = v_url_ini + "/getDM.php?USER=adlira&SOC="+ v_sociedad;
                urlAjax = `${v_url_ini}/getAdminData.php`
                console.log('urlAjax'); console.log(urlAjax);
                if(ind_conecta_json_sap === "1") {
                    BusyIndicator.show(0);
                    let data = "";
                    dataRes = await this.f_ajax('GET', urlAjax, data, oModel.getProperty("/token"));
                    BusyIndicator.hide();
                    dataRes = JSON.parse(dataRes);
                    console.log('dataRes'); console.log(dataRes);    
                }
                else {
                    // Simulación de datos si no hay conexión
                    dataRes = { 
                    }
                }

                if(dataRes != undefined && dataRes[0] != undefined && dataRes[0].type != undefined && dataRes[0].type == "E") {
                    if(dataRes[0].MESSAGE == undefined){ MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor"); }
                    else { MessageToast.show("Error en la respuesta al servidor, póngase en contacto con el proveedor (" + dataRes[0].MESSAGE + ")");  }
                    return;
                } 
                else {     
                    
                    
                    dataRes_T_Val = dataRes.T_VALIDACION; 
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
        */
        //FUNCIONES GENERALES  f_AjaxPost: f_AjaxGet:
        f_ajax: function (metodo, url, dataForm = undefined, p_token) {        
            
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
                                    //sap.m.MessageBox.information("No autorizado para realizar la acción, por favor ingrese nuevamente con un usuario autorizado");
                                
                                    sap.m.MessageBox.information("por favor vuelva a iniciar sesión");
                                    //that.f_logout();
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
        f_logout: function () {
            window.location.replace('./logout');
        },
        getRouter: function () { 
            return sap.ui.core.UIComponent.getRouterFor(this); 
        },
        pressBandejaSolicitud: function () {
            this.getRouter().navTo("Vista_Bandeja_Solicitud");
        },
        pressBandejaLiquidacion: function () {
            this.getRouter().navTo("Vista_Bandeja_Liquidacion"); 
        },
        pressLiberadorAnticipo: function () {
            this.getRouter().navTo("Vista_Liberador_Anticipo");
        },
        pressLiberadorLiquidacion: function () {
            this.getRouter().navTo("Vista_Liberador_Liquidacion");
        },
        pressAdministrador: function () {
            this.getRouter().navTo("Vista_Administrador");
        },
        pressHistorial: function () {
            this.getRouter().navTo("Vista_Historial_Aprobado");
        },
        
    });
});
