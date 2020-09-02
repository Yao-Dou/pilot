var light_colors = ["#f08080", "#dda0dd", "#a9d6bf", "#edbb85", "#add8e6"]
var dark_colors = ["#e83e3e", "#b875bb", "#75bd98", "#e39540", "#8fb1ca"]
var user_ids = ["001", "002", "003", "004", "005"]

$(document).ready(function () {
    $(document).on('mouseover','.quality-span',function(e){
        $(this).css("color","white")
        var quality_id = e.target.id
        var span_id = quality_id.replace("div", "p")
        var span = $("#" + span_id)
        var span_uid = span.attr("data-uid")
        var index = user_ids.indexOf(span_uid)
        $(this).css("background-color", dark_colors[index])
        span.css("border-color", dark_colors[index])
        span.css("color", dark_colors[index])
    });

    $(document).on('mouseout','.quality-span',function(e){
        $(this).css("color","revert")
        var quality_id = e.target.id
        var span_id = quality_id.replace("div", "p")
        var span = $("#" + span_id)
        var span_uid = span.attr("data-uid")
        var index = user_ids.indexOf(span_uid)
        $(this).css("background-color", light_colors[index])
        span.css("border-color", light_colors[index])
        span.css("color", "revert")
    });

    // $(document).on('mouseover','.annotation',function(e){
    //     var quality_id = e.target.id
    //     var div_id = quality_id.replace("p", "div")
    //     var div = $("#" + div_id)
    //     var span_uid = $(this).attr("data-uid")
    //     var index = user_ids.indexOf(span_uid)
    //     div.css("background-color", dark_colors[index])
    //     div.css("color","white")
    //     $(this).css("border-color", dark_colors[index])
    //     $(this).css("color", dark_colors[index])
    // });

    // $(document).on('mouseout','.annotation',function(e){
    //     var quality_id = e.target.id
    //     var div_id = quality_id.replace("p", "div")
    //     var div = $("#" + div_id)
    //     var span_uid = $(this).attr("data-uid")
    //     var index = user_ids.indexOf(span_uid)
    //     div.css("background-color", light_colors[index])
    //     div.css("color","revert")
    //     $(this).css("border-color", light_colors[index])
    //     $(this).css("color", "revert")
    // });
});