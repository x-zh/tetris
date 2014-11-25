$(function(){
    var config = {
        width: 10,
        height: 18
    };
    var board, currentBlock, nextBlock;

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
    var drawBoard = function(){
        
    }
    var genBlock = function(){
        var block, randI = (Math.floor(Math.random() * 7));
        switch(randI) {
            case 0: {
                block = [[0, 4], [1, 4], [0, 5], [1, 5]];
                break;
            } case 1: {
                block = [[0, 3], [0, 4], [0, 5], [0, 6]];
                break;
            } case 2: {
                block = [[0, 5], [1, 4], [1, 5], [2, 4]];
                break;
            } case 3: {
                block = [[0, 4], [1, 4], [1, 5], [2, 5]];
                break;
            } case 4: {
                block = [[0, 4], [1, 4], [1, 5], [1, 6]];
                break;
            } case 5: {
                block = [[0, 4], [1, 4], [2, 4], [2, 5]];
                break;
            } case 6: {
                block = [[0, 5], [1, 4], [1, 5], [1, 6]];
                break;
            }
        }
        return block;
    };
});
