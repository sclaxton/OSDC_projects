var expandAll = (function() {
    var $closingBracket,$expandedOnly,$hiddenBracket,$outerClosingBracket,expandTimeout
    var shrinkTimeout,$expand,$heading,$links,$editLink,$brackets
    $expand=$('#expand')
    console.log($expand)
    $heading=$expand.closest('#expand_heading')
    $editLink=$expand.find('a').eq(0)
    $editLink.attr("href","#expand")
    $links=$editLink
    $brackets=$([$expand.get(0).firstChild,$expand.get(0).lastChild]);
    console.log($brackets)
    function toggleText() {
        $links.text(function() { if ( $links.text() == "−" ) { return "+" } return "−";   
                               });
    }
    function expandSoon() {
        clearTimeout(shrinkTimeout);expandTimeout=setTimeout(expand,100);
    }
    function expand() {
        clearTimeout(shrinkTimeout);
        $heading.addClass('expand-expanded');
        $links.attr("style","opacity:0.6;");
    }
    function shrinkSoon() {
        clearTimeout(expandTimeout);shrinkTimeout=setTimeout(shrink,100);
    }
    function shrink(){
        clearTimeout(expandTimeout);
        if(!$links.is(':focus') && !$links.is(':hover') ){
            $heading.removeClass('expand-expanded');
            $links.attr("style", "opacity:1")
        }
    }
    if(!$brackets.hasClass('expand-bracket')){
        $brackets=$brackets.wrap($('<span>').addClass('expand-bracket')).parent();
    }
    $closingBracket=$brackets.last();
    $heading.on({'mouseenter':expandSoon,'mouseleave':shrinkSoon});
    $links.on({'focus':expand, 'blur':shrinkSoon,'click':toggleText});
})(); 

