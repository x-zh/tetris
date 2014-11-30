$(function(){
    var config = {
        width: 10,
        height: 18,
        interval: 100
    };
    var board, currentBlock, nextBlock, score, gameStatus, lines;
    var initBoard = function(){
        // initial a board, store game data
        board = new Array(config.height);
        for(var i=0;i<18;i++){     
            board[i] = new Array(10);      
        }     
        for(var i=0;i<18;i++){      
            for(var j=0; j<10; j++){      
                board[i][j] = 0;      
            }      
        }
    };
    var genBlock = function(){
        // assign next block to current block
        // generate next block randomly
        nextBlock = nextBlock || new Block(blockTypes[Math.floor(Math.random() * 7)]);
        currentBlock = nextBlock;
        currentBlock._fillBlock();
        nextBlock = new Block(blockTypes[Math.floor(Math.random() * 7)]);
        showNext();
        if (!currentBlock.inBoundary()) {
            // game ends here
            gameStatus = 'dead';
            return 
        }
    };
    var showNext = function(){
        // draw the next block in next block board
        $('#next_block .block').css('background', '#ecf0f1');
        for(var i=0; i<nextBlock.activeBlock.length; i++){
            var x = parseInt(nextBlock.activeBlock[i][0] + 1),
                y = parseInt(nextBlock.activeBlock[i][1] - 3);
            $('.next-block-'+x+'-'+y).css('background', '#e74c3c');
        }
    }
    var clearLine = function(lineNumber){
        // clear the `lineNumber` on the board, because it's full
        // replace current line with its above, till top, then clear top 
        for(var i=lineNumber; i>0; i--){
            for(var j=0; j<config.width; j++){
                board[i][j] = board[i-1][j];
                var color = $('.block-' + (i - 1) + '-' + j).css('background');
                $('.block-' + i + '-' + j).css('background', color);
            }
        }
        for(var j=0; j<config.width; j++){
            board[0][j] = 0;
            $('.block-' + i + '-' + j).css('background', '#ecf0f1');
        }
    };
    var clearFullLines = function(){
        // check each line, see if it's full
        // if it's full, call clearline to clear it
        var cleared = 0;
        for(var i=0; i<config.height; i++){
            var clearFlag = true;
            for(var j=0; j<config.width; j++){
                if(board[i][j] == 0){
                    clearFlag = false;
                    break;
                }
            }
            if (clearFlag){
                clearLine(i);
                cleared += 1;
            }
        }
        if(cleared > 0){
            // if there is some line been cleared, update scores
            score += Math.round((1000 / parseInt(config.interval)) * Math.round(Math.pow(3, cleared - 1)));
            lines += cleared
            $('#score span').text(score);
            $('#lines span').text(lines);
        }
    };
    var keyDown = function(){
        // key bindings, arrow keys. 
        if(gameStatus == 'pause' || gameStatus == 'dead') {
            return
        }
        if(window.timeout){
            // window.timeout is for blocks that arrived bottom
            // a timeout is needed for player to rearrange the position
            // if rearrangement is made, clear timeout and redo the moveDown
            clearTimeout(window.timeout);
            window.timeout = null;
        }
        if(!window.timer){
            // in the begining, need keyDown to trigger game-start
            window.timer = setInterval(function(){currentBlock.moveDown();}, config.interval);
        }
        switch(event.keyCode){      
            case 37:{     
                currentBlock.moveLeft();     
                break;      
            }      
            case 38:{     
                currentBlock.rotate();      
                break;      
            }      
            case 39:{      
                currentBlock.moveRight();      
                break;     
            }      
            case 40:{      
                currentBlock.moveDown();
                break;      
            }      
        }      
    }

    var blockTypes = ['o', 'i', 'z', 's', 'j', 'l', 't'];
    // different type of blocks name based on its shape
    var colors = {
        'o': '#16a085',
        'i': '#27ae60',
        'z': '#2980b9',
        's': '#8e44ad', 
        'j': '#f39c12',
        'l': '#e67e22',
        't': '#e74c3c'
    };  // colors for different type of blocks
    var blocks = {
        'o': [[0, 4], [1, 4], [0, 5], [1, 5]],
        'i': [[0, 3], [0, 4], [0, 5], [0, 6]],
        'z': [[0, 5], [1, 4], [1, 5], [2, 4]],
        's': [[0, 4], [1, 4], [1, 5], [2, 5]],
        'j': [[0, 4], [1, 4], [1, 5], [1, 6]],
        'l': [[0, 4], [1, 4], [2, 4], [2, 5]],
        't': [[0, 5], [1, 4], [1, 5], [1, 6]],
    };  // initial position for different type of blocks 
    
    // Block Class
    function Block(type){
        this.type = type;
        this.offset = [0, 0];
        this.activeBlock = blocks[type];

        this._emptyBlock = function(){
            // clear the painting on html DOM by reset it's background 
            for(var i=0; i<this.activeBlock.length; i++){
                var x = parseInt(this.activeBlock[i][0] + this.offset[0]),
                    y = parseInt(this.activeBlock[i][1] + this.offset[1]);
                $('.block-'+x+'-'+y).css('background', '#ecf0f1');
            }
        };

        this._fillBlock = function(){
            // fill the painting on html DOM by set its background
            for(var i=0; i<this.activeBlock.length; i++){
                var x = parseInt(this.activeBlock[i][0] + this.offset[0]),
                    y = parseInt(this.activeBlock[i][1] + this.offset[1]);
                $('.block-'+x+'-'+y).css('background', colors[this.type]);
            }
        };

        this._getBottom = function(){
            // block arrives the bottom (border or there is another block below)
            var b = this;
            clearInterval(window.timer);
            window.timer = null;
            // stop auto moveDown
            function t(){
                // if after timeout there is no operation from player
                // then this method will be called
                // frozen this block
                for(var i = 0; i < b.activeBlock.length; i ++){
                    var x = (b.activeBlock[i][0] + b.offset[0]),
                        y = (b.activeBlock[i][1] + b.offset[1]);
                    board[x][y] = 1;
                }
                // clear all the full lines
                clearFullLines();
                // generate a new block, use nextBlock as currentBlock
                genBlock();
                // start auto moveDown
                if(!window.timer && gameStatus == 'running') 
                    window.timer = setInterval(function(){currentBlock.moveDown();}, config.interval);
            }
            // set timeout for tmp
            window.timeout = setTimeout(t, config.interval * 3);
        };

        this.moveDown = function(){
            this._emptyBlock();
            this.offset[0] += 1;
            if(!this.inBoundary()){
                this.offset[0] -= 1;
                this._fillBlock();
                this._getBottom();
            } else {
                this._fillBlock();
            }
        };
        this.moveLeft = function(){
            this._emptyBlock();
            this.offset[1] -= 1;
            if(!this.inBoundary()){
                this.offset[1] += 1;
            }
            this._fillBlock();
        };
        this.moveRight = function(){
            this._emptyBlock();
            this.offset[1] += 1;
            if(!this.inBoundary()){
                this.offset[1] -= 1;
            }
            this._fillBlock();
        };
        this.rotate = function(){
            // find central x, y coordinate
            var cx = 0, cy = 0;
            for(var i=0; i<this.activeBlock.length; i++){
                cx += parseInt(this.activeBlock[i][0]);
                cy += parseInt(this.activeBlock[i][1]);
            }
            cx = Math.round(cx/4);
            cy = Math.round(cy/4);
            // rotate
            var afterRotate = [], tmp;
            for(var i=0; i<this.activeBlock.length; i++){
                afterRotate.push([cx + cy - this.activeBlock[i][1], 
                    cy - cx + this.activeBlock[i][0]]);
            }
            // temp to store activeBlock in case rollback is needed
            tmp = this.activeBlock;
            this._emptyBlock();
            this.activeBlock = afterRotate;
            if(!this.inBoundary()){
                // if after rotate, the block is conflict with boundaraies
                // roll back
                this.activeBlock = tmp;
            }
            this._fillBlock();
        }
        this.inBoundary = function(){
            // check all the boundaries, border and other blocks
            for(var i = 0; i < this.activeBlock.length; i ++){
                var x = (this.activeBlock[i][0] + this.offset[0]),
                    y = (this.activeBlock[i][1] + this.offset[1]);
                if (x >= config.height || x < 0 || y >= config.width || y < 0)
                    return false;
                if (board[x][y] == 1)
                    return false;
            }
            return true;
        };
    }

    window.start = function(diff){
        // game control, parameter is the interval for auto moveDown
        score = 0, lines = 0;
        initBoard();
        $('.block').css('background', '#ecf0f1');
        genBlock();
        document.onkeydown = keyDown;
        config.interval = parseInt(diff);
        // stop auto moveDown, wait for first Keydown to actually trigger
        clearInterval(window.timer);
        window.timer = null;
        gameStatus = 'running';
    };
    window.pause = function(){
        // pause and resume game by clear or set time interval for auto moveDown
        if(gameStatus == 'running'){
            clearInterval(window.timer);
            window.timer = null;
            gameStatus = 'pause';
            $('#pauseBtn').text('Resume');
        } else if(gameStatus == 'pause') {
            clearInterval(window.timer);
            window.timer = setInterval(function(){currentBlock.moveDown();}, config.interval);
            gameStatus = 'running';
            $('#pauseBtn').text('Pause');
        }
    };

    var drawBoard = function(){
        // draw board by jQuery append divs
        var $board = $('#board');
        for(var i = 0; i < config.height; i++){
            $row = $('<div></div>').addClass('row-' + i);
            for(var j = 0; j < config.width; j++){
                $block = $('<span>&nbsp;</span>').addClass('block')
                    .addClass('block-' + i + '-' + j);
                $row.append($block);
            }
            $board.append($row);
        }
    };
    // run it in the beginning 
    drawBoard();

    var drawNextBoard = function(){
        // draw next-block board by jQuery append divs
        var $board = $('#next_block'); 
        for(var i = 0; i < 4; i++){
            $row = $('<div></div>').addClass('row-' + i);
            for(var j = 0; j < 4; j++){
                $block = $('<span>&nbsp;</span>').addClass('block')
                    .addClass('next-block-' + i + '-' + j);
                $row.append($block);
            }
            $board.append($row);
        }
    };
    // run it in the beginning 
    drawNextBoard();
});
