var Montage = require("montage").Montage,
    Scroll = require("ui/scroll").Scroll,
    Component = require("ui/component").Component
    TranslateComposer = require("ui/composer/translate-composer").TranslateComposer;

exports.Scroller = Montage.create(Component, {

    _scroll: {
        enumerable: false,
        value: null
    },

    _scrollX: {
        enumerable: false,
        value: 0
    },

    scrollX: {
        get: function () {
            return this._scrollX;
        },
        set: function (value) {
            this._scrollX = value;
            this.needsDraw = true;
        }
    },

    _scrollY: {
        enumerable: false,
        value: 0
    },

    scrollY: {
        get: function () {
            return this._scrollY;
        },
        set: function (value) {
            this._scrollY = value;
            this.needsDraw = true;
        }
    },

    _axis: {
        enumerable: false,
        value: "auto"
    },

    axis: {
        get: function () {
            return this._axis;
        },
        set: function (value) {
            this._axis = value;
            this.needsDraw = true;
        }
    },

    _displayScrollbars: {
        enumerable: false,
        value: "auto"
    },

    displayScrollbars: {
        get: function () {
            return this._displayScrollbars;
        },
        set: function (value) {
            switch (value) {
                case "vertical":
                case "horizontal":
                case "both":
                case "auto":
                    this._displayScrollbars = value;
                    break;
                default:
                    this._displayScrollbars = "none";
                    break;
            }
            this.needsDraw = true;
        }
    },

    _hasMomentum: {
        enumerable: false,
        value: true
    },

    hasMomentum: {
        get: function () {
            return this._hasMomentum;
        },
        set: function (value) {
            this._hasMomentum = value;
        }
    },

    _hasBouncing: {
        enumerable: false,
        value: true
    },

    hasBouncing: {
        get: function () {
            return this._hasBouncing;
        },
        set: function (value) {
            this._hasBouncing = value;
        }
    },

    _momentumDuration: {
        enumerable: false,
        value: 650
    },

    momentumDuration: {
        get: function () {
            return this._momentumDuration;
        },
        set: function (value) {
            this._momentumDuration = value;
        }
    },

    _bouncingDuration: {
        enumerable: false,
        value: 750
    },

    bouncingDuration: {
        get: function () {
            return this._bouncingDuration;
        },
        set: function (value) {
            this._bouncingDuration = value;
        }
    },

    _content: {
        enumerable: false,
        value: null
    },
    
    templateDidLoad: {
        value: function () {
            var orphanedFragment,
                currentContentRange = this.element.ownerDocument.createRange();

            currentContentRange.selectNodeContents(this.element);
            orphanedFragment = currentContentRange.extractContents();
            this._content.appendChild(orphanedFragment);
        }
    },
    
    prepareForDraw: {
        value: function () {
            var self = this;
            this._scroll = Montage.create(TranslateComposer);
            this.addComposer(this._scroll);
            Object.defineBinding(this._scroll, "translateX", {boundObject: this, boundObjectPropertyPath: "scrollX", oneway: false});
            Object.defineBinding(this._scroll, "translateY", {boundObject: this, boundObjectPropertyPath: "scrollY", oneway: false});

            this._scroll.axis = this.axis;
            this._scroll.hasBouncing = this.hasBouncing;
            this._scroll.hasMomentum = this.hasMomentum;
            this._scroll.bouncingDuration = this.bouncingDuration;
            this._scroll.momentumDuration = this.momentumDuration;

            this._scroll.addEventListener("scrollStart", function () {
                self._scrollBars.opacity = .5;
            }, false);
            this._scroll.addEventListener("scrollEnd", function () {
                self._scrollBars.opacity = 0;
            }, false);
        }
    },

    willDraw: {
        enumerable: false,
        value: function () {
            this._left = this._element.offsetLeft;
            this._top = this._element.offsetTop;
            this._width = this._element.offsetWidth;
            this._height = this._element.offsetHeight;
            this._scroll.maxTranslateX = this._content.scrollWidth - this._width;
            if (this._scroll.maxTranslateX < 0) {
                this._scroll.maxTranslateX = 0;
            }
            this._scroll.maxTranslateY = this._content.offsetHeight - this._height;
            if (this._scroll.maxTranslateY < 0) {
                this._scroll.maxTranslateY = 0;
            }
            var delegateValue = this.callDelegateMethod("didSetMaxScroll", {x: this._scroll.maxTranslateX, y: this._scroll.maxTranslateY});
            if (delegateValue) {
                this._scroll.maxTranslateX = delegateValue.x;
                this._scroll.maxTranslateY = delegateValue.y;
            }
            switch (this._displayScrollbars) {
                case "horizontal":
                    this._scrollBars.displayHorizontal = true;
                    this._scrollBars.displayVertical = false;
                    break;
                case "vertical":
                    this._scrollBars.displayHorizontal = false;
                    this._scrollBars.displayVertical = true;
                    break;
                case "both":
                    this._scrollBars.displayHorizontal = true;
                    this._scrollBars.displayVertical = true;
                    break;
                case "auto":
                    if (this._scroll._maxTranslateX && this._scroll._maxTranslateY) {
                        this._scrollBars.displayHorizontal = true;
                        this._scrollBars.displayVertical = true;
                    } else {
                        if (this._scroll._maxTranslateX) {
                            this._scrollBars.displayHorizontal = true;
                            this._scrollBars.displayVertical = false;
                        } else {
                            if (this._scroll._maxTranslateY) {
                                this._scrollBars.displayHorizontal = false;
                                this._scrollBars.displayVertical = true;
                            } else {
                                this._scrollBars.displayHorizontal = false;
                                this._scrollBars.displayVertical = false;
                            }
                        }
                    }
                    break;
                case "none":
                    this._scrollBars.displayHorizontal = false;
                    this._scrollBars.displayVertical = false;
                    break;
            }
            if (this._scrollBars.displayHorizontal) {
                if (this._content.scrollWidth) {
                    this._scrollBars.horizontalLength = this._width / this._content.scrollWidth;
                    this._scrollBars.horizontalScroll = this._scrollX / this._content.scrollWidth;
                } else {
                    this._scrollBars.horizontalLength = 1;
                    this._scrollBars.horizontalScroll = 0;
                }
            }
            if (this._scrollBars.displayVertical) {
                if (this._content.offsetHeight) {
                    this._scrollBars.verticalLength = this._height / this._content.offsetHeight;
                    this._scrollBars.verticalScroll = this._scrollY / this._content.offsetHeight;
                } else {
                    this._scrollBars.verticalLength = 1;
                    this._scrollBars.verticalScroll = 0;
                }
            }            
        }
    },

    draw: {
        enumerable: false,
        value: function () {
            this._content.style.webkitTransform="translate3d("+(-this._scrollX)+"px, "+(-this._scrollY)+"px, 0)";
        }
    }
});