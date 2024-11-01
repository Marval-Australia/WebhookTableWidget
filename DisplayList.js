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
            this._defaultLinkUrl = MarvalSoftware.UI.WebHelper.getApplicationPath();
        }
        this._createPreference(
            "tableHeaderColour",
            this._services.resource.getString("TABLE_HEADER_COLOUR"),
            "#4F81BD",
            MarvalSoftware.UI.Controls.Widgets.TileWidget.Preferences.Controls.ColourInput,
            { automaticColour: "#4F81BD" },
            [
                new MarvalSoftware.UI.Controls.Widgets.TileWidget.Preferences.Validators.RequiredField(this._services.resource.getString("REQUIRED_COUNTER_BORDER_COLOUR")),
                new MarvalSoftware.UI.Controls.Widgets.TileWidget.Preferences.Validators.RegularExpression(
                    this._services.resource.getString("TABLE_HEADER_COLOUR"),
                    /^#[a-fA-F0-9]{3}([a-fA-F0-9]{3})?$/
                )
            ]
        );
        this._createPreference(
            "counterTextColour",
            this._services.resource.getString("COUNTER_ROW_COLOUR"),
            "#DCE6F1",
            MarvalSoftware.UI.Controls.Widgets.TileWidget.Preferences.Controls.ColourInput,
            { automaticColour: "#DCE6F1" },
            [
                //    new MarvalSoftware.UI.Controls.Widgets.TileWidget.Preferences.Validators.RequiredField(this._services.resource.getString("REQUIRED_COUNTER_TEXT_COLOUR")),
                new MarvalSoftware.UI.Controls.Widgets.TileWidget.Preferences.Validators.RegularExpression(
                    this._services.resource.getString("INVALID_COUNTER_TEXT_COLOUR"),
                    /^#[a-fA-F0-9]{3}([a-fA-F0-9]{3})?$|^$/
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

        const tagValue = PluginCallBackHREF.split("tag=")[1];
        this._titleElement.innerHTML = tagValue;


        $('a[href="/MSM"]').attr('href', PluginCallBackHREF);
        $('a[href="' + PluginCallBackHREF + '"]').filter(function () {
            return $(this).css('background-image').includes("tile_widget_default_link_icon.png");
        }).css({
            'background': 'none',
            'color': '#696969',
            'font-size': '12px',
            'text-align': 'center',
            'line-height': '16px',
            'font-weight': 'bold',
            'padding-right': '16px'
        }).text('CSV')
            .attr('title', 'Download as CSV');

        $('a[href="' + PluginCallBackHREF + '"]').on('click', function (event) {
            event.preventDefault(); // Prevent default link behavior

            // Fetch JSON data
            $.get(PluginCallBackHREF, function (dataText) {
                var data = JSON.parse(dataText);

                // Convert JSON data to CSV
                function JSONtoCSV(json) {
                    const items = json;
                    const replacer = (key, value) => value === null ? '' : value;
                    const header = Object.keys(items[0]);
                    const csv = [
                        header.join(','), // header row first
                        ...items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
                    ].join('\r\n');
                    return csv;
                }

                const csvData = JSONtoCSV(data);

                // Download CSV file
                const blob = new Blob([csvData], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = 'data.csv';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            });
        });


        $.get(PluginCallBackHREF, function (dataText) {
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
                <tr class="header-color"  style="
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

            headers.forEach(function (key) {
                pageData.find("thead tr").append("<th style='padding: 0px; border: 1px solid #A6A6A6;'>" + key + "</th>");
            });


            data.forEach(function (item, index) {
                var rowColor = index % 2 === 0 ? "#DCE6F1" : "#FFFFFF";
                var rowClass = index % 2 === 0 ? "alternate-row" : "normal-row";

                var row = $("<tr style='background-color: " + rowColor + "' class='" + rowClass + "'></tr>");
                headers.forEach(function (key) {
                    row.append("<td style='padding: 8px; border: 1px solid #A6A6A6; text-align: center;'>" + (item[key] !== null ? item[key] : "") + "</td>");
                });
                pageData.find("tbody").append(row);
            });

            $(that._contentElement).empty().append(pageData);
            var textColour = that._preferences["counterTextColour"].getValue()

            $('.alternate-row').css('background-color', textColour);
            var pagerText = "TestText";
            var pagerTitle = "TestTitle";

            var tableHeaderColour = that._preferences["tableHeaderColour"].getValue()
            $('.header-color').css('background-color', tableHeaderColour);
            var itemsText = pagerText.match(/(\d+) items\./);

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
