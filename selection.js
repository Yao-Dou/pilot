/**
 * Map from selection id (e.g., "selection-1") to the Characters
 */
let all_colors = ['blue', 'green', 'red', 'purple', 'pink', 'gold', 'navy', 'orange']
var situation_text = {};
var old_value = ""
class AllCharacters {
    constructor() {
        this.situations = new Map();
    }
    init(sids) {
        for (let sid of sids) {
            var arr = []
            this.situations.set(sid, arr);
        }
    }
    add_characters(sid, num) {
        // console.log(this.situations)
        this.situations.get(sid).push(new Characters(sid, num))
    }
    add(sid, cs, num, start_end_pair) {
        if (!this.situations.has(sid)) {
            console.warn('Situation ' + sid + ' not found in map?');
            return;
        }
        // console.log(start_end_pair)
        // console.log(num)
        this.situations.get(sid)[num].add(cs, start_end_pair);
        // console.log(this.situations.get(sid)[num].start_end_pairs)
    }
    remove(sid, cs, num) {
        if (!this.situations.has(sid)) {
            console.warn('Situation ' + sid + ' not found in map?');
            return;
        }
        this.situations.get(sid)[num].remove(cs);
    }
    /**
     * Fully refresh state.
     */
    update() {
        this.render();
        this.serialize();
    }
    render() {
        for (let situation of this.situations.values()) {
            for (let display of situation){
                display.render();
            }
        }
    }
    serialize() {
        if ($("#no_badness").is(':not(:checked)')) {
            for (let situation of this.situations.values()) {
                var situationID = situation[0].situationID
                let serialize = $('#' + situationID + '-serialize');
                var result = []
                for (let display of situation){
                    var vals = display.serialize();
                    if (vals) {
                        result.push(vals)
                    }
                }
                serialize.attr('value', '[' + result + ']');
            }
        } else {
            for (let situation of this.situations.values()) {
                var situationID = situation[0].situationID
                let serialize = $('#' + situationID + '-serialize');
                var result = []
                for (let display of situation){
                    var vals = display.serialize();
                    if (vals) {
                        result.push(vals)
                    }
                }
                old_value = '[' + result + ']';
            }
        }
    }
}
/**
 * What's selected.
 */
class Characters {
    constructor(situationID, num) {
        this.situationID = situationID;
        this.start_end_pairs = []
        this.data = [];
        this.color = all_colors[num % all_colors.length]
        this.displayID = situationID + '-display-' + num;
        this.serializeID = situationID + '-serialize';
        this.deleted = false
    }
    add(newCS, pair) {
        // check for duplicates and add if it's not there.
        for (let oldCS of this.data) {
            if (oldCS.equals(newCS)) {
                // animate it to show it exists.
                oldCS.noticeMeSenpai = true;
                return;
            }
        }
        this.data.push(newCS);
        this.start_end_pairs.push(pair);
    }
    remove(cs) {
        for (let i = this.data.length - 1; i >= 0; i--) {
            if (this.data[i].equals(cs)) {
                this.data.splice(i, 1);
                this.start_end_pairs.splice(i, 1);
            }
        }
    }
    render() {
        if (this.deleted) {
            return
        }
        if (this.data.length == 0) {
            var p_text = $('#' + this.displayID).attr('data-p-text')
            var situation_id = $('#' + this.displayID).attr('data-situation-id')
            $('#' + situation_id + "-quality-" + p_text).remove()
            var quality_list = quality_map[situation_id]
            // console.log(quality_list)
            quality_list[quality_list.indexOf(p_text)] = ""
            // console.log(quality_list)
            $('#' + this.displayID).remove()
            this.deleted = true
        }
        let display = $('#' + this.displayID).empty();
        for (let i = 0; i < this.data.length; i++) {
            display.append(this.data[i].render(this.situationID, this.color, i));
        }
    }
    serialize() {
        let strings = [];
        for (let character of this.data) {
            strings.push(character.serialize(this.situationID));
        }
        let vals = strings.join(',');
        return vals
    }
}
class CharacterSelection {
    constructor(start, end, num) {
        this.start = start;
        this.end = end;
        this.num = num
        this.noticeMeSenpai = false;
    }
    equals(other) {
        return this.start == other.start && this.end == other.end;
    }
    render(situationID, color, num_in_quality) {
        let start = this.start, end = this.end, num = this.num; // so they go in the closure
        let txt = $('#' + situationID).text().substring(start, end);
        let removeButton = $('<button></button>')
            .addClass('bg-transparent white bn hover-black hover-bg-white br-pill mr1')
            .append('✘')
            .on('click', function () {
                document.getElementById(situationID).innerHTML = situation_text[situationID]
                AC.remove(situationID, new CharacterSelection(start, end, num), num);
                AC.update();
            });
        let span = $('<span></span>')
            .addClass('b bg-' + color + ' white pa2 ma1 br-pill dib quality-span')
            .append(removeButton)
            .append(txt);
        span.attr('data-situation-id', situationID)
        span.attr('data-quality-num', num)
        span.attr('data-num', num_in_quality)
        // if the character needs to be noticed, abide.
        if (this.noticeMeSenpai) {
            this.noticeMeSenpai = false;
            span.addClass("animated bounce faster");
            setTimeout(function () {
                span.removeClass('animated bounce faster');
            }, 1000);
        }
        return span;
    }
    serialize(situationID) {
        let txt = $('#' + situationID).text().substring(start, end);
        let quality_name = quality_map[situationID][this.num]
        let new_quality_name = quality_name.replace(/,/g, "<SEP>"); 
        console.log($('#' + situationID).text())
        // console.log($('#' + situationID).text().substring(0, 5))
        console.log($('#' + situationID).text().length)
        return '[' + new_quality_name + ',' + this.start + ',' + this.end + ']';
    }
}

// globals
let AC = new AllCharacters();
// provided externally to the script!
let start;
let end;
let n_situations = 1;
let situationID;
var quality_map = {};
// script
$(document).ready(function () {
    // build up elements we're working with
    let situationIDs = [], situationIDsJquery = [];
    // we have 2 as default for running this script independently during development
    let local_n_situations = n_situations || 2;
    for (let i = 0; i < local_n_situations; i++) {
        situationIDs.push('situation-' + i);
        situationIDsJquery.push('#situation-' + i);
        quality_map['situation-' + i] = []
        situation_text['situation-' + i] = $('#' + 'situation-' + i).text()
    }
    // initialize our data structures NOTE: later we'll have to add data that's loaded
    // into the page (the machine's default guesses). or... maybe we won't?
    AC.init(situationIDs);
    var pageX;
    var pageY;
    $(situationIDsJquery.join(',')).on("mousedown", function(e){
        pageX = e.pageX;
        pageY = e.pageY;
    });
    $(situationIDsJquery.join(',')).on('mouseup', function (e) {
        situationID = e.target.id;
        let selection = window.getSelection();
        if (selection.anchorNode != selection.focusNode || selection.anchorNode == null) {
            // highlight across spans
            return;
        }
        $('#text_input').val('');
        $('#quality-selection').fadeOut(1);
        let range = selection.getRangeAt(0);
        [start, end] = [range.startOffset, range.endOffset];
        if (start == end) {
            // disable on single clicks
            return;
        }
        // manipulate start and end to try to respect word boundaries and remove
        // whitespace.
        end -= 1; // move to inclusive model for these computations.
        let txt = $('#' + situationID).text();
        while (txt.charAt(start) == ' ') {
            start += 1; // remove whitespace
        }
        while (start - 1 >= 0 && txt.charAt(start - 1) != ' ') {
            start -= 1; // find word boundary
        }
        while (txt.charAt(end) == ' ') {
            end -= 1; // remove whitespace
        }
        while (end + 1 <= txt.length - 1 && txt.charAt(end + 1) != ' ') {
            end += 1; // find word boundary
        }
        // move end back to exclusive model
        end += 1;
        // stop if empty or invalid range after movement
        if (start >= end) {
            return;
        }
        selection_text = $('#' + situationID).text().substring(start, end)

        document.getElementById("selection_text").innerHTML = "Selected Span: <a class=\"selection_a\">" + selection_text + "</a>"
        $('#quality-selection').css({
            'display': "inline-block",
            'left': pageX + 5,
            'top' : pageY - 120
        }).fadeIn(200, function() {
            $('#confirm').prop('disabled', false);
        });
        document.getElementById("text_input").select();
    });
    $('#confirm').click(function(e) {
        // var disabled = $(this).prop("disabled")

        // get text input value
        var input_text = document.getElementById("text_input").value;
        // add any characters. (moving end back to exclusive model)
        if (input_text.trim() != "") {
            var quality_list = quality_map[situationID]
            if (!quality_list.includes(input_text)) {
                // add display-num to the display
                AC.add_characters(situationID, quality_list.length)
                let display = $('#' + situationID + "-display")
                var p = $("<h2>" + input_text + "</h2>")
                p.css('color', all_colors[quality_list.length % all_colors.length]);
                p.attr('id', situationID + "-quality-" + input_text)
                p.attr('contentEditable', "true")
                p.attr('data-situation-id', situationID)
                p.attr('data-quality-num', quality_list.length)
                p.attr('class', 'quality')
                display.append(p)
                var numth_display = $('<div></div>')
                numth_display.attr('id', situationID + '-display-' + quality_list.length)
                numth_display.attr('data-situation-id', situationID)
                numth_display.attr('data-quality-num', quality_list.length)
                numth_display.attr('data-p-text', input_text)
                display.append(numth_display)
                quality_map[situationID].push(input_text)
            }
            quality_list = quality_map[situationID]
            var index = quality_list.indexOf(input_text)
            AC.add(situationID, new CharacterSelection(start, end, index), index, [start, end]);
            AC.update();
        }
        $('#quality-selection').fadeOut(1, function() {
            $('#confirm').prop('disabled', true);
        });
    });
    $(document).on('focusout','.quality',function(e){
        var situation_id = $(this).attr("data-situation-id")
        var quality_num = $(this).attr("data-quality-num")
        var new_quality = $(this).text()
        quality_map[situation_id][quality_num] = new_quality
        AC.update()
    });
    $(document).on('mouseover','.quality-span',function(e){
        $(this).css("color","black")
        var quality_id = e.target.id
        var situation_id = $(this).attr("data-situation-id")
        var quality_num = $(this).attr("data-quality-num")
        var span_num = $(this).attr("data-num")

        var start_end_pair = AC.situations.get(situation_id)[quality_num].start_end_pairs[span_num]
        let text = document.getElementById(situation_id).innerHTML
        start_temp = start_end_pair[0]
        end_temp = start_end_pair[1]
        subtxt = text.substring(start_temp, end_temp)
        front_part = text.substring(0, start_temp)
        end_part = text.substring(end_temp)
        old_text = text
        text = front_part + "<span class=\"white bg-"+all_colors[quality_num % all_colors.length]+"\">" + subtxt + "</span>" + end_part
        document.getElementById(situation_id).innerHTML = text
    });
    $(document).on('mouseout','.quality-span',function(e){
        $(this).css("color","white")
        var quality_id = e.target.id
        var situation_id = $(this).attr("data-situation-id")
        document.getElementById(situation_id).innerHTML = situation_text[situation_id]
    });
   
    $("#no_badness").change(function(){
        if($(this).is(':checked')) {
            old_value = $("#situation-0-serialize").attr("value")
            $("#situation-0-serialize").attr("value", "There is no badeness in text.")
        } else {
            $("#situation-0-serialize").attr("value", old_value)
        }
     });
    // $(document).on('mouseover','.quality',function(e){
    //     $(this).css("font-weight","Bold")
    //     var quality_id = e.target.id
    //     var situation_id = $(this).attr("data-situation-id")
    //     var quality_num = $(this).attr("data-quality-num")
    //     var curr_start_end_pairs = JSON.parse(JSON.stringify(AC.situations.get(situation_id)[quality_num].start_end_pairs))
    //     // console.log(curr_start_end_pairs)
    //     curr_start_end_pairs.sort(function(a,b){return a[0] -  b[0];});
    //     let text = document.getElementById(situation_id).innerHTML
    //     text = text.replace(/<\/?span[^>]*>/g,"");
    //     let new_text = ""
    //     for (i in curr_start_end_pairs) {
    //         pair = curr_start_end_pairs[i]
    //         let before_pair_end;
    //         if (i == 0) {
    //             before_pair_end = 0
    //         } else {
    //             before_pair_end = curr_start_end_pairs[i-1][1]
    //         }
    //         start_temp = pair[0]
    //         end_temp = pair[1]

            // if (start_temp >= before_pair_end) {
            //     // the new pair is totally behind
            //     subtxt = text.substring(start_temp, end_temp)
            //     span_to_add = "<span class=\"white bg-"+all_colors[quality_num % all_colors.length]+"\">" + subtxt + "</span>"
            //     new_text += text.substring(before_pair_end, start_temp) + span_to_add
            // } else {
            //     // the new pair is halfway through
            //     subtxt = text.substring(before_pair_end, end_temp)
            //     span_to_add = "<span class=\"white bg-"+all_colors[quality_num % all_colors.length]+"\">" + subtxt + "</span>"
            //     new_text += span_to_add
            // }
    //     }
    //     curr_start_end_pairs.sort(function(a,b){return a[1] -  b[1];});
    //     subtxt = text.substring(curr_start_end_pairs[curr_start_end_pairs.length - 1][1], text.length)
    //     new_text += subtxt
    //     document.getElementById(situation_id).innerHTML = new_text
    // });
    // $(document).on('mouseout','.quality',function(e){
    //     $(this).css("font-weight","normal")
    //     var quality_id = e.target.id
    //     var situation_id = $(this).attr("data-situation-id")
    //     var quality_num = $(this).attr("data-quality-num")
    //     document.getElementById(situation_id).innerHTML = situation_text[situation_id]
    // });
    $("#text_input").on('keydown',function(e) {
        var disabled = $('#confirm').prop("disabled")
        if(e.key === "Enter" && !disabled) {
            event.preventDefault();
            $('#confirm').click();
        }
    });
});
