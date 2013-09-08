define([

],

function() {


    function ConversationNode(dom_node) {
        this.dom_node = dom_node;
        this.parent = null;
        this.children = [];
    }

    ConversationNode.prototype.addChild = function(node) {
        this.children.push(node);
        node.parent = this;
    };

    ConversationNode.prototype.toString = function() {
        return "{ \"" + this.dom_node.status.entity + "\": [" + this.children.toString() + "]}";
    };


    return ConversationNode;
});