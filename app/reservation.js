(function ($){
    
    $.fn.reservation = function(options){
        
        
    // -- INIT --
    var $self = $('<div id="reservation-wrapper"></div>').appendTo(this);
    var floors = [];
    var selectedTableID = null;
    var activeLevel = 0;
    var activeCellType = 'wall';
    
    // -- SETTINGS --
    var settings = $.extend({
        serverUrl: 'http://localhost:3000/floors',
        mode: 'mode-view',
        width: 15,
        height: 15,
        defaultTableCapacity: 4
    }, options);   
    // -- //SETTINGS --
    
    init();
    // -- //INIT --
    
    
    function init(){
        $self.addClass(settings.mode);
        // init of containers
        $self.append('<div id="level-select"></div>\
                     <div id="table-wrapper"></div>\
                     <div id="select-panel"></div>\
                     <div id="table-info-wrapper"></div>');
    };
    
    
    function getDefaultLevel(){
        var level = [];
        for(i = 0; i < settings.height; i++)
        {
            var row = [];
            for(k = 0; k < settings.width; k++)
            {
                var cell = {type: 'empty'};
                row.push(cell);
            }
            level.push(row);
        }
        return level;
    };
        
    function isAdmin(){
        return settings.mode == 'mode-admin';
    };
    
    
    // -- HELPERS --
    function removeByIndex(arr, index) {
        arr.splice(index, 1);
    }
    
    var isTableInArray = function(tableArray, table) {
        for(var i in tableArray) {
            if(tableArray[i].tableID === table.tableID)
                return true;
        }
        return false;
    }
    
    function getAllTables(floorId) {
        var arrOfTables = [];
        
        var rows = floors[floorId];
        for(var rowId in rows) {
            var cells = rows[rowId];

            for(var cellId in cells) {
                var cell = cells[cellId];                    

                if( cell.type === "table" ) {
                    if( !isTableInArray(arrOfTables, cell) )
                    {
                        arrOfTables.push(cell);
                    }
                }                         
            }
        }                    
        return arrOfTables;
    }
    
    
    
    // -- //HELPERS --
        
        
        
        
        
        
        
        
        
    // -- EVENT HANDLERS --
    if( !isAdmin() )
    {
        //select table
        $self.on('click', '#table-wrapper .table-free', function(){
            var $this = $(this);
            selectedTableID = parseInt($this.attr('data-table-id'));
            render();
            console.log("selectedTableID = ", selectedTableID);
        });
    }
    
    // select level
    $self.on('click', '.level-btn', function(){
        var index = $(this).parent().attr('data-level-id');
        activeLevel = index;
        render();
    });
    
    if( isAdmin() )
    {
        // delete level
        $self.on('click', '.delete-level', function(){
            var index = $(this).parent().attr('data-level-id');
            if( index == activeLevel)
            {
                alert('It is not possible to delete active floor!')
            }
            else
            {
                floors.pop();
                render();
            }
            
        });
        // add level
        $self.on('click', '.add-level-btn', function(){
            floors.push( getDefaultLevel() );
            activeLevel = floors.length-1;
            render();
        });
        // select cell type
        $self.on('click', '#select-panel .cell', function(){
            var $cell = $(this);
            activeCellType = $cell.attr('data-type');
            render();
        });
        // change cell type
        $self.on('click', '#table-wrapper .cell', function(){
            if( activeCellType === null)
            {
                alert('Choose field type!');
                return;
            }
            
            var $cell = $(this);
            var cellIndex = parseInt($cell.attr('data-index'));
            var rowIndex = parseInt($cell.parent().attr('data-index'));
            dataCell = floors[activeLevel][rowIndex][cellIndex];
            dataCell.type = activeCellType;
            
            if(dataCell.type === 'table') {
                var nearTable = getNearTable_MergeTable(activeLevel, rowIndex, cellIndex);
                
                dataCell.tableID = nearTable !== null ? nearTable.tableID : getNewTableID(activeLevel, rowIndex, cellIndex);
                dataCell.isTaken = false;
                dataCell.number = nearTable !== null ? nearTable.number : getNewTableNumber(activeLevel);
                dataCell.tableCapacity = nearTable !== null ? nearTable.tableCapacity : settings.defaultTableCapacity;
            }
            
            render();            
        });
        
        var cellTableOnHover = function(){
             var $cell = $(this);
             var cellId = $cell.attr('data-table-id');
             $('#table-info-wrapper [data-id="' + cellId + '"]').toggleClass('highlighted');
        };        
        $self.on('mouseenter mouseleave', '.cell-table', cellTableOnHover, cellTableOnHover);
        
        var cellTableInfoOnHover = function(){
            var $tableInfo = $(this);
            var tableInfoId = $tableInfo.attr('data-id');
            $self.find('#table-wrapper [data-table-id="' + tableInfoId + '"]').toggleClass('table-highlighted');
        };
        $self.on('mouseenter mouseleave', '#table-info-wrapper [data-id]', cellTableInfoOnHover, cellTableInfoOnHover);
        
       
        $self.on('change', '#table-info-wrapper .table-info-input', function(){
            var $infoTable = $(this);
            var tmpValue = $infoTable.val();
            if( !$.isNumeric(tmpValue) )
            {
                alert("Input is not a number!");
                return;
            }
            
            var infoTableProperty = parseInt(tmpValue);
            var infoTableId = parseInt($infoTable.parent().attr('data-id'));
            var tablesForChange = getTableArrayByID(infoTableId);
            var classForChange = ($infoTable.hasClass('info-capacity')) ? 'tableCapacity' : 'number';
            
            for(var i in tablesForChange)
            {
                tablesForChange[i][classForChange] = infoTableProperty;
            }
            render();
        });   
        
        
        
        
        
        
        // -- EVENT HANDLERS HELPERS --
        function getNearTable_MergeTable(floorID, rowID, cellID) {         
            
            var rows = floors[floorID];
            var nearTables = [];            
            
            var setNearTables = function(relPosition) {
                checkedRowID = rowID + relPosition.y;
                checkedCellID = cellID + relPosition.x;

                if(!(checkedRowID in rows))
                    return;
                var cells = rows[ checkedRowID ];
                
                if(!(checkedCellID in cells))
                    return;
                var checkedCell = cells[ checkedCellID ];
                
                if(checkedCell.type == "table"){ 
                    if(!isTableInArray( nearTables, checkedCell )) {
                        nearTables.push(checkedCell);
                    }
                }
                    
            }
            
            
            var nearPositions = [
                // ---
                // -OX
                // ---
                {x: 1, y: 0},
                
                // ---
                // XO-
                // ---
                {x: -1, y: 0},
                
                // -X-
                // -O-
                // ---
                {x: 0, y: -1},
                
                // ---
                // -O-
                // -X-
                {x: 0, y: 1},
                
                // X--
                // -O-
                // ---
                {x: -1, y: -1},
                
                // --X
                // -O-
                // ---
                {x: 1, y: -1},
                
                // ---
                // -O-
                // X--
                {x: -1, y: 1},
                
                // ---
                // -O-
                // --X
                {x: 1, y: 1}
            ]
            
            nearPositions.map(setNearTables);
            
            
            
            var getIndexOfMinNumber = function(nearTables) {    
                var indexOfMinNumber = null;
                
                for(var i in nearTables) {
                    if(indexOfMinNumber === null)
                        indexOfMinNumber = 0;
                    else {
                        var nearTable = nearTables[i];
                        var savedNearTable = nearTables[indexOfMinNumber];
                        if(nearTable.number < savedNearTable.number)
                            indexOfMinNumber = i;
                    }
                }                    
                return indexOfMinNumber;
            }
            
            var indexOfMinNumber = getIndexOfMinNumber(nearTables);
            
            var nearTable = null;
            
            if(indexOfMinNumber !== null) {
                nearTable = nearTables[indexOfMinNumber];
                removeByIndex(nearTables, indexOfMinNumber);
            }
            
            mergeTables(nearTables, nearTable);          

            return nearTable;           
        }
          
        
        function mergeTables(tables, sourceTable) {
            for(var i in tables) {
                var table = tables[i];
                var cells = getTableArrayByID(table.tableID);
                
                for(var j in cells) {
                    var cell = cells[j];
                    
                    cell.tableID = sourceTable.tableID;
                    cell.number = sourceTable.number;
                    cell.tableCapacity = sourceTable.tableCapacity;
                }
            }
        }
        
        function getTableArrayByID(id) {
            var tables = [];
            
            for(var floorId in floors){
                var rows = floors[floorId];
                
                for(var rowId in rows) {
                    var cells = rows[rowId];
                    
                    for(var cellId in cells) {
                        var cell = cells[cellId];                    

                        if( cell.tableID === id )
                            tables.push(cell);
                    }
                }
            }
            return tables;
        }
        
        
        function getNewTableID() {
            var maxTableId = 0;
            
            for(var floorId in floors){
                var rows = floors[floorId];
                
                for(var rowId in rows) {
                    var cells = rows[rowId];
                    
                    for(var cellId in cells) {
                        var cell = cells[cellId];                    

                        if( cell.tableID > maxTableId )
                            maxTableId = cell.tableID;
                    }
                }
            }
            return maxTableId + 1;
        }        
        
        
        
        function getNewTableNumber(floorId) {
            var maxTableNumber = 0;
            
            var rows = floors[floorId];
            for(var rowId in rows) {
                var cells = rows[rowId];
                for(var cellId in cells) {
                    var cell = cells[cellId];                    
                    
                    if( cell.number > maxTableNumber )
                        maxTableNumber = cell.number;
                }
                    
            }
            return maxTableNumber + 1;
        }
        // -- //EVENT HANDLERS HELPERS --
    }
    // -- //EVENT HANDLERS --
    
        
        
        
        
        
        
        
        
        
        
        
    
    // -- VIEW --
    // cell rendering
    var renderCell = function(dataCell, index){
        var $row = this.$row;        
        var $cell = $('<div class="cell"></div>');
        $cell
            .addClass('cell-' + dataCell.type)
            .attr('data-index', index);
        
        if(dataCell.type == 'table') {
            
            var tableClass = function() {
                if ( isAdmin() )
                    return '';
                    
                var cls = 'table-';
                if(selectedTableID === dataCell.tableID)
                    cls += 'selected';
                else
                    cls += dataCell.isTaken ? 'taken' : 'free';
                return cls;
            }           
            
            $cell
                .addClass( tableClass() )
                .attr('data-table-id', dataCell.tableID)
                .attr('data-capacity', dataCell.tableCapacity)
                .append('<span class="table-number">' + dataCell.number + '</span>')
                .append('<span class="tooltiptext">Table number: ' + dataCell.number + ' <br>  Table capacity: ' + dataCell.tableCapacity +'</span>');
                
        }    
        $row.append($cell);
    };    
    
    // row rendering
    var renderRow = function(dataRow, index){
        var $cont = this.$cont;        
        var $row = $('<div class="cell-row"></div>').attr('data-index', index);
        dataRow.map(renderCell,{$row:$row});
        $cont.append($row);
    };
    
    // navigation rendering
    var renderNavigationLevel= function(level, index){
        var $navCont = this.$navCont;
        var activeLevel = this.selectedLevel;
        var activeClass = (activeLevel == index) ? 'active' : '';
        var dataLength = this.dataLength;
        var deleteLevelBtn = (isAdmin() && index == (dataLength-1)) ? '<a class="delete-level">X</a>' : '';
    
        
        var $level = $('<div class="level" data-level-id="' + index + '"> <a class="level-btn ' + activeClass +'">'+ (index+1) +'</a> ' + deleteLevelBtn + ' </div>');
        $navCont.append($level);
    }
    
    // select panel rendering
    var renderSelectPanel = function(par){
        
        var getElementTemplate = function(elementData){
            var activeClass = activeCellType === elementData.type ? 'cell-active' : '';
            
            return '<div class="cell-row">\
                        <div class="cell ' + elementData.class + ' ' + activeClass + '" data-type="' + elementData.type + '"></div>\
                        <div class="cell-desc">'+ elementData.description +'</div>\
                    </div>';
        };
        
        var data = [];
        
        if(!isAdmin()) {
            data = [
                {
                    class: 'cell-table table-selected',
                    description: 'Selected table',
                    type: 'table'
                },
                 {
                    class: 'cell-table table-taken',
                    description: 'Occupied table',
                    type: 'table'
                },
                 {
                    class: 'cell-table table-free',
                    description: 'Free table',
                    type: 'table'
                }
            ]
        }
        else {
            data = [
                {
                    class: 'cell-empty',
                    description: 'Empty space',
                    type: 'empty'
                },
                 {
                    class: 'cell-wall',
                    description: 'Wall',
                    type: 'wall'
                },
                 {
                    class: 'cell-table',
                    description: 'Table',
                    type: 'table'
                    
                }
            ]
        }
        
        var selectPanelTemplate = data.map(getElementTemplate).join('');
             
        this.$selectPanelCont.append(selectPanelTemplate);
    };
    
    // info table rendering
    var renderTableInfo = function(){
        var $contTableInfo = this.$contTableInfo;
        
        var allTables = getAllTables(activeLevel);
        
        var tableIds = '';
        var tableCapacities = '';
        
        for(var i in allTables) {
            var table = allTables[i];
            
            tableIds += '<div class="table-id-row" data-id="' + table.tableID + '">\
                            <input type="text" class="table-info-input info-number" value="' + table.number + '">\
                         </div>';
            tableCapacities += '<div class="table-capacity-row" data-id="' + table.tableID + '">\
                                    <input type="text" class="table-info-input info-capacity" value="' + table.tableCapacity + '">\
                                </div>';
        }
        
        
        $contTableInfo.append('<div id="table-info-header">\
             Tables\
         </div>\
         <div class="table-info-cont">\
             <div class="table-id">\
                 <div class="table-id-header">\
                     Number\
                 </div>\
                 '+ tableIds +'\
             </div>\
             <div class="table-capacity">\
                 <div class="table-c\apacity-header">\
                     Capacity\
                 </div>\
                 '+ tableCapacities +'\
             </div>\
         </div>\
     </div>    ');
        
        
        
    };
    
    
    
    
    // render function
    var render = function(level){
        // optional parameter level
        level = typeof level !== 'undefined' ? level : activeLevel;

        if(!(level in floors))
        {
            console.log("wrong level");
            return;
        }
         
        // -- CONTAINERS --
        var $cont = $self.children('#table-wrapper').empty();
        var $navCont = $self.children('#level-select').empty();          
        var $selectPanelCont = $self.children('#select-panel').empty();

        var $contTableInfo = null;
        if ( isAdmin() ) {
            $contTableInfo = $self.children('#table-info-wrapper').empty();
        }
        // -- //CONTAINERS --
        
         
        // -- RENDERS --
        renderSelectPanel.call({$selectPanelCont: $selectPanelCont});

        // render level
        floors[level].map(renderRow, {$cont:$cont});

        // render navigation levels
        floors.map(renderNavigationLevel, {$navCont:$navCont, selectedLevel: level, dataLength: floors.length});

        if(isAdmin()){
            // render add-level-btn to navigation
            $navCont.append('<div class="add-level"><a class="add-level-btn">+</a></div>');
            // render TableInfo
            renderTableInfo.call({$contTableInfo: $contTableInfo});
        }
        // -- //RENDERS --        
    }; 
    
    
    // -- //VIEW --
    
        
        
        
        
        
        
        
       
    // -- API --
    return {
        // returns selected table id(int) / null
        getSelectedTableID: function(){ return selectedTableID; },
        // returns array of floors with rows and cells
        getData: function(){ return floors; },
        // sets data
        setData: function(data){ 
            floors = data;
            render();
        },
        // load data; optional url(string)
        loadData: function(url, callback){
            var serverUrl = url || settings.serverUrl;
            // $.ajaxSetup({async:false});  
            $.get(serverUrl, function(d){
                floors = d;
                if(floors.length === 0) {
                    floors.push( getDefaultLevel() );
                }
                render();
                
                if( callback ){
                    callback();
                }
            }); 
        },
        // save data; optional url(string)
        // post the whole collection of floors
        saveData: function(url, callback){
            var serverUrl = url || settings.serverUrl;
            // $.ajaxSetup({async:false});              
            $.ajax ({
                url: serverUrl,
                type: "POST",
                data: JSON.stringify(floors),
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                success: function(response){
                    if( callback ){
                        callback(response);
                    }
                }
            });       
        },
        // get server url(string)
        getServerUrl: function(){ return settings.serverUrl; }
    };
       
    // -- //API --
    };
   }(jQuery));