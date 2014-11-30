$(function(){
    var config = {
        width: 10,
        height: 18,
        interval: 100
    };
    var board, currentBlock, nextBlock, score, gameStatus, lines;
    var initBoard = function(){
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
    var blockTypes = ['o', 'i', 'z', 's', 'j', 'l', 't'];
    var colors = {
        'o': '#16a085',
        'i': '#27ae60',
        'z': '#2980b9',
        's': '#8e44ad', 
        'j': '#f39c12',
        'l': '#e67e22',
        't': '#e74c3c'
    }
    var blocks = {
        'o': [[0, 4], [1, 4], [0, 5], [1, 5]],
        'i': [[0, 3], [0, 4], [0, 5], [0, 6]],
        'z': [[0, 5], [1, 4], [1, 5], [2, 4]],
        's': [[0, 4], [1, 4], [1, 5], [2, 5]],
        'j': [[0, 4], [1, 4], [1, 5], [1, 6]],
        'l': [[0, 4], [1, 4], [2, 4], [2, 5]],
        't': [[0, 5], [1, 4], [1, 5], [1, 6]],
    };
    var clearLine = function(lineNumber){
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
        score += Math.round((1000 / parseInt(config.interval)) * Math.round(Math.pow(3, cleared - 1)));
        lines += cleared
        $('#score span').text(score);
        $('#lines span').text(lines);
    };
    function Block(type){
        this.type = type;
        this.offset = [0, 0];
        this.activeBlock = blocks[type];
        this._emptyBlock = function(){
            for(var i=0; i<this.activeBlock.length; i++){
                var x = parseInt(this.activeBlock[i][0] + this.offset[0]),
                    y = parseInt(this.activeBlock[i][1] + this.offset[1]);
                $('.block-'+x+'-'+y).css('background', '#ecf0f1');
            }
        };
        this._fillBlock = function(){
            for(var i=0; i<this.activeBlock.length; i++){
                var x = parseInt(this.activeBlock[i][0] + this.offset[0]),
                    y = parseInt(this.activeBlock[i][1] + this.offset[1]);
                $('.block-'+x+'-'+y).css('background', colors[this.type]);
            }
        };
        this.getBottom = function(){
            var b = this;
            clearInterval(window.timer);
            window.timer = null;
            function emergency(){
                // frozen this block
                for(var i = 0; i < b.activeBlock.length; i ++){
                    var x = (b.activeBlock[i][0] + b.offset[0]),
                        y = (b.activeBlock[i][1] + b.offset[1]);
                    board[x][y] = 1;
                }
                clearFullLines();
                genBlock();
                if(!window.timer && gameStatus == 'running') 
                    window.timer = setInterval(function(){currentBlock.moveDown();}, config.interval);
            } 
            window.timeout = setTimeout(emergency, config.interval * 3);
        };
        this.moveDown = function(){
            this._emptyBlock();
            this.offset[0] += 1;
            if(!this.inBoundary()){
                this.offset[0] -= 1;
                this._fillBlock();
                this.getBottom();
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
            var cx = 0, cy = 0;
            for(var i=0; i<this.activeBlock.length; i++){
                cx += parseInt(this.activeBlock[i][0]);
                cy += parseInt(this.activeBlock[i][1]);
            }
            cx = Math.round(cx/4);
            cy = Math.round(cy/4);
            var afterRotate = [], tmp;
            for(var i=0; i<this.activeBlock.length; i++){
                afterRotate.push([cx + cy - this.activeBlock[i][1], 
                    cy - cx + this.activeBlock[i][0]]);
            }
            tmp = this.activeBlock;
            this._emptyBlock();
            this.activeBlock = afterRotate;
            if(!this.inBoundary()){
                this.activeBlock = tmp;
            }
            this._fillBlock();
        }
        this.inBoundary = function(){
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
    var random7 = function(){
        return Math.floor(Math.random() * 7);
    }
    var genBlock = function(){
        nextBlock = nextBlock || new Block(blockTypes[random7()]);
        currentBlock = nextBlock;
        currentBlock._fillBlock();
        nextBlock = new Block(blockTypes[random7()]);
        showNext();
        if (!currentBlock.inBoundary()) {
            // game ends here
            gameStatus = 'dead';
            return 
        }
    };
    var drawBoard = function(){
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
    var keyDown = function(){
        if(gameStatus == 'pause' || gameStatus == 'dead') {
            return
        }
        if(window.timeout){
            clearTimeout(window.timeout);
            window.timeout = null;
        }
        if(!window.timer) window.timer = setInterval(function(){currentBlock.moveDown();}, config.interval);
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
    var drawNextBoard = function(){
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
    var showNext = function(){
        $('#next_block .block').css('background', '#ecf0f1');
        for(var i=0; i<nextBlock.activeBlock.length; i++){
            var x = parseInt(nextBlock.activeBlock[i][0] + 1),
                y = parseInt(nextBlock.activeBlock[i][1] - 3);
            $('.next-block-'+x+'-'+y).css('background', '#e74c3c');
        }
    }
    window.start = function(diff){
        score = 0, lines = 0;
        initBoard();
        $('.block').css('background', '#ecf0f1');
        genBlock();
        document.onkeydown = keyDown;
        config.interval = parseInt(diff);
        gameStatus = 'running';
    };
    window.pause = function(){
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
    drawNextBoard();
    drawBoard();
});
