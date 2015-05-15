/*
 * A somewhat jQuery-like toolbox
 *
 * Not a monade. But close.
 *
 * "I'll give you my jQuery when you pry it from my cold, dead hands!"
 */

// ** hidden helper object (static methods)
function M(list) {
    this.length = 0;

    this.add(list);
}

M.copyObj = function(from, to) {
    for(var name in from) {
        to[name] = from[name];
    }
};

M.each = function(list, cb) {
    if(M.isList(list)) {
        for(var i=0; i<list.length; i++) {
            cb.call(new M([list[i]]), i, list[i]);
        }
    } else {
        for(var name in list) {
            cb.call(new M([list[name]]), name, list[name]);
        }
    }
};

M.isList = function(v) {
    return !!v && typeof v == 'object' && typeof v.length != 'undefined';
};

// ** hidden helper object (normal methods)
M.copyObj({
    each: function(cb) {
        M.each(this, cb);
    },

    attr: function(attr, val) {
        if(typeof attr=='string' && typeof val=='undefined') {
            return this[0] ? this[0].getAttribute(attr) : null;
        } else {
            if(typeof attr=='string') {
                var t = attr;
                attr = {};
                attr[t] = val;
            }
            this.each(function(i, node) {
                M.each(attr, function(k, v) {
                    node.setAttribute(k, v);
                });
            });
        }

        return this;
    },

    css: function(style, val) {
        if(typeof style=='string' && typeof val=='undefined') {
            return this[0] ? this[0].style[style] : null;
        } else {
            if(typeof style=='string') {
                var t = style;
                style = {};
                style[t] = val;
            }
            this.each(function(i, node) {
                M.each(style, function(k, v) {
                    node.style[k] = v;
                });
            });
        }

        return this;
    },

    filter: function(filter) {
        var newList = [];
        this.each(function(i, node) {
            switch(filter[0]) {
                case '.': if(node.getAttribute('class').split(' ').indexOf(filer.substr(1))>=0) newList.push(node);
                case '#': if(node.getAttribute('id')==filter.substr(1)) newList.push(node);
                default: if(node.nodeName.toLowerCase()==filter) newList.push(node);
            }

        });
        return new M(newList);
    },

    add: function(list) {
        for(var i = 0, len = list.length; i < len; i++) {
            this[this.length++] = list[i];
        }
        return this;
    },

    get: function(i) {
        return this[i>=0 ? i : 0];
    },

    find: function(selector) {
        var all = [];

        for(var i=0; i<this.length; i++) {
            var node = this[i];
                selected = [];

            switch(selector[0]) {
                case '.': selected = node.getElementsByClassName(selector.substr(1)); break;
                case '@': selected = document.getElementsByName(selector.substr(1)); break;
                case '#': selected = [document.getElementById(selector.substr(1))]; break;
                default: selected = node.getElementsByTagName(selector); break;
            }

            if(node!=document && (selector[0]=='@' || selector[0]=='#')) {
                var keep = [];

                for(var ii=0; ii<selected.length; ii++) {
                    var test = selected[ii];
                    if(all.indexOf(test)==-1) {
                        while(test.nodeName!='BODY' && test!=node)
                            test = test.parentNode;
                        if(test==node) {
                            keep.push(selected[ii]);
                        }
                    }
                }
                selected = keep;
            }

            for(var ii=0; ii<selected.length; ii++) {
                if(all.indexOf(selected[ii])==-1) all.push(selected[ii]);
            }
        }

        return new M(all);

    },

    eq: function(i) {
        return new M([this[i]]);
    },

    on: function(name, cb, args) {
        this.each(function(i, node) {
            var capture = (name == 'blur' || name == 'focus');

            function triggerHandler(eventName, event, target) {
                return ( name != eventName) || cb.apply(new M([node]), args || [event, i]);
            };
            
            function eventHandler(event) {
                if(!triggerHandler(name, event, event['target'])) {
                    event['preventDefault']();
                    event['stopPropagation']();
                }
            };

            
            node.addEventListener(name, eventHandler, capture);
        });

        return this;
    },

    clone: function() {
        var list = [];

        this.each(function(i, node) {
            list.push(node.cloneNode(true));
        });

        return new M(list);
    },

    detach: function() {
        if(!this.length) return new M([]);
        var node = this[0].cloneNode(true);
        this[0].remove();
        return new M([node]);
    },

    attach: function(node) {
        if(this.length)
            this[0].appendChild(node.get());
    },

    replace: function(node) {
        if(this.length)
            this[0].parentNode.replaceChild(node.get(), this[0]);
    },

    remove: function() {
        this.each(function(i, node) {
            node.remove();
        });
        return new M([]);
    },

    parent: function() {
        var list = [];

        this.each(function(i, node) {
            list.push(node.parentNode);
        });

        return new M(list);
    }
}, M.prototype);

// ** visible $ thing
function $(selector) {
    return new M([document]).find(selector);
}

$.ajax = function(uri, success, fail) {
    var xmlhttp;

    if (window.XMLHttpRequest) {
        // code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
    } else {
        // code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    if(typeof fail!='function') fail = function(status) { console.log(status); };

    xmlhttp.onreadystatechange = function() {
        if(xmlhttp.readyState == XMLHttpRequest.DONE) {
            if(xmlhttp.status == 200) {
                success(xmlhttp.responseText);
            } else {
                fail(xmlhttp.status);
            }
        }
    }

    xmlhttp.open("GET", uri, true);
    xmlhttp.send();
};
