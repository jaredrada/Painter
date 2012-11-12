$(document).ready(function(){
    var socket = io.connect(),
        image = $('#box'),
        imageHeight = image.height(),
        imageWidth = image.width(),
        blockSize = 20,
        rows = imageHeight / blockSize,
        cols = imageWidth / blockSize,
        clients = [],
        playerLocal = $('.player'),
        progress,
        active = false;

    var div,
        frag = document.createDocumentFragment();
    for(var i = 0, len = cols*rows; i < len; i++) {
        div = document.createElement('div');
        div.setAttribute('id', i.toString());
        div.setAttribute('class', 'square');
        div.setAttribute('style', 'height:'+blockSize+"px;width:"+blockSize+"px");
        frag.appendChild(div);
    }

    image.hide();
    image.append(frag);

    image.on('mouseenter', '.square', function(){
        var id = $(this);
        if(id.css('background-color') == 'rgb(221, 221, 221)' && active) {
            id.css({'background-color':'transparent'});
            socket.emit('square', {square: id.attr('id')});
        }
    });

    $('.stats').on('click', '.startGame', function(){
        socket.emit('start');
    });

    socket.on('joinAccept', function(data){
        $('#players').html('<div class="button startGame">Start Game</div>');
        progress = $('#progress').percentageLoader({
            width:180,
            height: 180,
            value: '1pts'
        });
    });

    socket.on('joinDecline', function(data){
        image.off('mouseenter', '.square');
        $('#players').html('<p>Sorry, there is a game already in progress!</p>');
        $('#progress, #field').hide();
        socket.disconnect();
    });

    socket.on('startGame', function(data){
        var waiting = $('.waiting'),
            numPlayers = data.players.length,
            playerFrag = document.createDocumentFragment();

        for( i = 0; i < numPlayers; i++) {
            var j = i + 1,
                label = document.createElement('label'),
                text = document.createTextNode('Player '+j+": "),
                input = document.createElement('input');
                label.setAttribute('for', "player"+i);
                label.appendChild(text);
                input.setAttribute('id', "player"+i);
            playerFrag.appendChild(label);
            playerFrag.appendChild(input);
        }

        $('#players').append(playerFrag);


        //yes i know this is shitty code
        waiting.fadeOut(500, function(){
            waiting.html('3');
            waiting.fadeIn(500).fadeOut(500, function(){
                waiting.html('2');
                waiting.fadeIn().fadeOut(500, function(){
                    waiting.html('1');
                    waiting.fadeIn().fadeOut(500, function(){
                        waiting.html("GO!");
                        waiting.fadeIn(500, function(){
                            waiting.hide();
                            active = true;
                            image.show();
                        })
                    })
                })
            })
        })
    });

    socket.on('show', function(data){
        var complete = 0;
        $('#'+data.square).css({'background':'none'});
        _.each(data.players, function(num, key){
            complete = complete + num.points;
        });
        progress.setProgress(Math.floor(complete/(cols*rows)*100)/100);
        progress.setValue(complete+' pts');
        _.each(data.players, function(num, key){
            $('#player'+key).val(num.points);
        });
        console.log(io.sockets.clients(id));
    });

    socket.on('gameOver', function(data){
        alert('Game over');
    });
});
