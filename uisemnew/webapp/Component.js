/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define([
        "sap/ui/core/UIComponent",
        "sap/ui/Device",
        "nsnew/uisemnew/model/models"
    ],
    function (UIComponent, Device, models) {
        "use strict";

        return UIComponent.extend("nsnew.uisemnew.Component", {
            metadata: {
                manifest: "json"
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: function () {
                // call the base component's init function
                UIComponent.prototype.init.apply(this, arguments);
                sap.ui.getCore().getConfiguration().setLanguage("ES");
                var oData = {            
                    "T_EST_SOL": [
                        {"id": "C", "descripcion": "Creado"}, 
                        {"id": "A", "descripcion": "Con Anticipo"}, 
                        {"id": "G", "descripcion": "Con Liquidación"}, 
                        //{"id": "X", "descripcion": "Liquidado"}, 
                        {"id": "X", "descripcion": "Concluido"}, 
                        {"id": "B", "descripcion": "Borrado"},
                        {"id": "C,A,G,X,B", "descripcion": "Todos"}
                    ],
                    "T_EST_ORD": [
                        {"id": "C", "descripcion": "Creado"}, 
                        {"id": "L", "descripcion": "Liberado"}, 
                        {"id": "R", "descripcion": "Rechazado"}, 
                        {"id": "G", "descripcion": "Con liquidación"}, 
                        {"id": "X", "descripcion": "Liquidado"},
                        {"id": "P", "descripcion": "Aprob.Smart"}, 
                        {"id": "B", "descripcion": "Borrado"},
                        {"id": "T", "descripcion": "Todos"}
                    ],
                    "T_EST_LIQ": [
                        {"id": "C", "descripcion": "Creado"}, 
                        {"id": "G", "descripcion": "Guardado Localmente"}, 
                        {"id": "V", "descripcion": "Guardado para verificación"}, 
                        {"id": "X", "descripcion": "Liquidado"}, 
                        {"id": "R", "descripcion": "Rechazado"},
                        {"id": "B", "descripcion": "Borrado"},
                        {"id": "T", "descripcion": "Todos"}
                    ],
                    "T_EST_GTO": [
                        {"id": "C", "descripcion": "Creado"}, 
                        {"id": "B", "descripcion": "Borrado"},
                        {"id": "R", "descripcion": "Rechazado"},
                        {"id": "V", "descripcion": "Guardado para verificación"}, 
                        {"id": "P", "descripcion": "Contabilizado preliminar"}, 
                        {"id": "A", "descripcion": "Contabilizado"}, 
                        {"id": "T", "descripcion": "Todos"}
                    ],
                    "T_TIPO_SOLICITUD": [
                        {"id": "ERE", "descripcion": "Entregas a rendir"}, 
                        {"id": "REE", "descripcion": "Reembolso"}, 
                        {"id": "CCH", "descripcion": "Caja chica"}, 
                    ],
                    "T_NOMBRE_USUARIO": [
                        {"id": "jclira", "descripcion": "Cesar Lira"}, 
                        {"id": "nlira", "descripcion": "Nilo Lira"}, 
                        {"id": "grios", "descripcion": "German Rios"}, 
                        {"id": "fsoto", "descripcion": "Franklin Soto"}, 
                        {"id": "adlira", "descripcion": "Dayana Lira"}, 
                        {"id": "E", "descripcion": "Usuario E"}, 
                    ],
                    "REGEX_COMPROBANTE" : "/^[A-Za-z0-9]{4}-[A-Za-z0-9]{8}$/",
                    "sol_field1": {"descripcion": "Orden de Transporte", "ind_active_visible": true},  //activado para sociedad La calera
                };
                var oModel = new sap.ui.model.json.JSONModel(oData);
                this.setModel(oModel, "myParam");

                // enable routing
                this.getRouter().initialize();

                // set the device model
                this.setModel(models.createDeviceModel(), "device");
            }
        });
    }
);