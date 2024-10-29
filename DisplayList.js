/// <reference path="~/RFP/Assets/Scripts/MarvalSoftware/MarvalSoftware.js"/>
/// <reference path="~/RFP/Assets/Scripts/MarvalSoftware/UI/Controls/ScriptManager.js"/>
/// <reference path="~/RFP/Assets/Scripts/MarvalSoftware/UI/Controls/Widgets/TileWidget.js"/>
/// <reference path="~/RFP/Assets/Scripts/MarvalSoftware/UI/Dom/Dom.js"/>
/// <reference path="~/RFP/Assets/Scripts/MarvalSoftware/UI/Dom/EventManager.js"/>
/// <reference path="~/RFP/Assets/Scripts/MarvalSoftware/UI/WebHelper.js"/>

MarvalSoftware.registerNamespace("MarvalSoftware.Widgets");
//var widgetThing;
MarvalSoftware.Widgets.DisplayList = MarvalSoftware.UI.Controls.Widgets.TileWidget.extend({
    _scriptMethodProxy: null,
    _getDisplayListStatisticsRequest: null,
    _dashboardStatistics: null,
    init: function () {
        /// <summary>
        /// Initialises a new instance of the DisplayList class.
        /// </summary>

        MarvalSoftware.UI.Controls.Widgets.TileWidget.call(this, "Display List", null, null, 30);
        this._scriptMethodProxy = new MarvalSoftware.Net.ScriptMethodProxy(MarvalSoftware.UI.WebHelper.getApplicationPath() + "/Ajax/AjaxService.asmx");
    },
    _setupPreferences: function () {
        /// <summary>
        /// Sets up the dashboard widgets preferences.
        /// </summary>
  
        MarvalSoftware.UI.Controls.Widgets.TileWidget.prototype._setupPreferences.call(this);
        this._createPreference(
            "plugincallback",
            "Plugin Callback",
            null,
            MarvalSoftware.UI.Controls.Widgets.TileWidget.Preferences.Controls.TextInput,
            {},
            [new MarvalSoftware.UI.Controls.Widgets.TileWidget.Preferences.Validators.RequiredField(this._services.resource.getString("REQUIRED_LIST"))]
        );
        var plugincallback = MarvalSoftware.Serialization.Json.deserialize(this._preferences["plugincallback"].getValue());
        if (plugincallback) {
            this._defaultLinkUrl = plugincallback;
        }
         this._createPreference(
             "counterColour",
             this._services.resource.getString("COUNTER_COLOUR"),
             "#333",
             MarvalSoftware.UI.Controls.Widgets.TileWidget.Preferences.Controls.ColourInput,
             { automaticColour: "#333" },
        [
                new MarvalSoftware.UI.Controls.Widgets.TileWidget.Preferences.Validators.RequiredField(this._services.resource.getString("REQUIRED_COUNTER_COLOUR")),
                 new MarvalSoftware.UI.Controls.Widgets.TileWidget.Preferences.Validators.RegularExpression(
                     this._services.resource.getString("INVALID_COUNTER_COLOUR"),
                     /^#[a-fA-F0-9]{3}([a-fA-F0-9]{3})?$/
                )
             ]
         );
         this._createPreference(
            "counterHighlightColour",
            this._services.resource.getString("COUNTER_HIGHLIGHT_COLOUR"),
            "#AAA",
            MarvalSoftware.UI.Controls.Widgets.TileWidget.Preferences.Controls.ColourInput,
            { automaticColour: "#AAA" },
            [
                new MarvalSoftware.UI.Controls.Widgets.TileWidget.Preferences.Validators.RequiredField(this._services.resource.getString("REQUIRED_COUNTER_HIGHLIGHT_COLOUR")),
                new MarvalSoftware.UI.Controls.Widgets.TileWidget.Preferences.Validators.RegularExpression(
                    this._services.resource.getString("INVALID_COUNTER_HIGHLIGHT_COLOUR"),
                    /^#[a-fA-F0-9]{3}([a-fA-F0-9]{3})?$/
                )
            ]
        );
        this._createPreference(
            "counterBorderColour",
            this._services.resource.getString("COUNTER_BORDER_COLOUR"),
            "#000",
            MarvalSoftware.UI.Controls.Widgets.TileWidget.Preferences.Controls.ColourInput,
            { automaticColour: "#000" },
            [
                new MarvalSoftware.UI.Controls.Widgets.TileWidget.Preferences.Validators.RequiredField(this._services.resource.getString("REQUIRED_COUNTER_BORDER_COLOUR")),
                new MarvalSoftware.UI.Controls.Widgets.TileWidget.Preferences.Validators.RegularExpression(
                    this._services.resource.getString("INVALID_COUNTER_BORDER_COLOUR"),
                    /^#[a-fA-F0-9]{3}([a-fA-F0-9]{3})?$/
                )
            ]
        );
        this._createPreference(
            "counterTextColour",
            this._services.resource.getString("COUNTER_TEXT_COLOUR"),
            "#FFF",
            MarvalSoftware.UI.Controls.Widgets.TileWidget.Preferences.Controls.ColourInput,
            { automaticColour: "#FFF" },
            [
                new MarvalSoftware.UI.Controls.Widgets.TileWidget.Preferences.Validators.RequiredField(this._services.resource.getString("REQUIRED_COUNTER_TEXT_COLOUR")),
                new MarvalSoftware.UI.Controls.Widgets.TileWidget.Preferences.Validators.RegularExpression(
                    this._services.resource.getString("INVALID_COUNTER_TEXT_COLOUR"),
                    /^#[a-fA-F0-9]{3}([a-fA-F0-9]{3})?$/
                )
            ]
        );
    },
    _setupStyles: function () {
        /// <summary>
        /// Sets up the dashboard widgets styles.
        /// </summary>

        MarvalSoftware.UI.Controls.Widgets.TileWidget.prototype._setupStyles.call(this);
        this._styles.contentElement.textAlign = "center";
        this._styles.contentElement.padding = "0";
       // this._styles.contentElement.overflow = "scroll";
        MarvalSoftware.augment(this._styles, {
            aElement: { display: "inline-block", margin: "10px", height: "130px", width: "150px", verticalAlign: "top", textDecoration: "none" },
            gaugeSvgElement: { margin: "15px 0" },
            counterSvgElement: { margin: "25px 0" },
            divElement: { minHeight: "30px" }
        });
    },
    _savePreferences: function () {
        /// <summary>
        /// Saves preferences.
        /// </summary>

        // save preferences
        var isValid = MarvalSoftware.UI.Controls.Widgets.TileWidget.prototype._savePreferences.call(this);

        if (isValid) {
            this._renderDisplayListStatistics();
        }
    },
    _refresh: function () {
        console.log("Running refresh function");
        
        /// <summary>
        /// Refreshes the dashboard widget.
        /// </summary>

        if (!this._preferences["plugincallback"].getValue()) {

        } else {
            this._renderDisplayListStatistics();
        
        }
        
        this._setIsLoading(false);

        if (this._getDisplayListStatisticsRequest && this._getDisplayListStatisticsRequest.isExecuting) {
            this._getDisplayListStatisticsRequest.abort();
        }

    },
    _loadDisplayListStatistics: function (dashboardStatistics) {

     
        this._renderDisplayListStatistics();

      
        this._setIsLoading(false);
    },
    _renderDisplayListStatistics: function () {
        /// <summary>
        
        /// Remders dashboard statistics.
        /// </summary>
        var that = this;

       var PluginCallBackHREF = this._preferences["plugincallback"].getValue();
        console.log("Full preferences is ", PluginCallBackHREF);
        const tagValue = PluginCallBackHREF.split("tag=")[1];
        this._titleElement.innerHTML = tagValue;
        $.get(PluginCallBackHREF, function(dataText) {
            var data = JSON.parse(dataText);

    var divElement = document.createElement("DIV");
    
    var pageData = $(`
        <table style="
            border-collapse: collapse;
            
            width: 100%;
            font-family: Arial, sans-serif;
            color: #333;
        ">
            <thead>
                <tr style="
                    background-color: #4F81BD; 
                    color: white;
                    font-weight: bold;
                    text-align: center;
                "></tr>
            </thead>
            <tbody></tbody>
        </table>
    `);
    
    var headers = Object.keys(data[0]);
    console.log("Headers are ", headers);
    headers.forEach(function(key) {
        pageData.find("thead tr").append("<th style='padding: 0px; border: 1px solid #A6A6A6;'>" + key + "</th>");
    });
    

    data.forEach(function(item, index) {
        var rowColor = index % 2 === 0 ? "#DCE6F1" : "#FFFFFF"; 
        var row = $("<tr style='background-color: " + rowColor + ";'></tr>");
        headers.forEach(function(key) {
            row.append("<td style='padding: 8px; border: 1px solid #A6A6A6; text-align: center;'>" + (item[key] !== null ? item[key] : "") + "</td>");
        });
        pageData.find("tbody").append(row);
    });
    
    console.log("Page data is ", pageData);
    $(that._contentElement).empty().append(pageData);  

    var pagerText = "TestText";
    var pagerTitle = "TestTitle";

   
    var itemsText = pagerText.match(/(\d+) items\./);
  
    if (itemsText && itemsText[1]) {

   
        console.log("Have title as ", pagerTitle);
   
        console.log("Number is ", itemsText[1]);
    } else {
        console.log("Text not found");
    }
});

        var currentUserId = MarvalSoftware.UI.Controls.ScriptManager.getInstance().getCurrentUserId();
        var currentUserCIId = MarvalSoftware.UI.Controls.ScriptManager.getInstance().getCurrentUserCIId();
          },
    _handleGetDisplayListStatisticsError: function () {
        /// <summary>
        /// Handles the GetDisplayListStatistics error.
        /// </summary>

        this._setIsLoading(false);
    }
});

MarvalSoftware.Widgets.DisplayList._svgNamespace = "http://www.w3.org/2000/svg";