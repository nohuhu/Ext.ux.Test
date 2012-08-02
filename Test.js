/*
 * Collection of testing utilities for Ext JS. Simulate keyboard and mouse
 * events, button clicks, field input and more.
 *
 * Version 0.9, compatible with Ext JS 4.1
 *
 * Copyright (c) 2012 Alexander Tokarev. Special thanks to IntelliSurvey, Inc.
 * for sponsoring my work on this code.
 *  
 * This code is licensed under the terms of the Open Source LGPL 3.0 license.
 * Commercial use is permitted to the extent that the code/component(s) do NOT
 * become part of another Open Source or Commercially licensed development library
 * or toolkit without explicit permission.
 * 
 * License details: http://www.gnu.org/licenses/lgpl.html
 */

Ext.define('Ext.ux.Test', {
    singleton: true,
    
    /*
     * @private Emulate mouse click event on target element
     *
     * @param {Ext.Element/HTMLElement} target Target element
     * @param {Object} options
     * @param {Bool}   .dblclick Emulate double click. Default: single click.
     * @param {Bool}   .right    Emulate right button click. Default: left button.
     * @param {Bool}   .ctrlKey  Ctrl key is pressed. Default: false.
     * @param {Bool}   .shiftKey Shift key is pressed. Default: false.
     * @param {Bool}   .altKey   Alt key is pressed. Default: false.
     */
    injectMouseClick: function(target, options) {
        if ( !target ) {
            throw 'Ext.ux.Test.injectMouseClick: Target is required';
        };
        
        if ( target.$className != 'Ext.dom.Element' ) {
            target = new Ext.Element(target);
        };
        
        options = options || {};
        
        // Denormalize buttons to match Ext.EventObjectImpl expectations
        var button =  Ext.isIE &&  options.right ? 4
                   : !Ext.isIE &&  options.right ? 1
                   :  Ext.isIE && !options.right ? 1
                   : !Ext.isIE && !options.right ? 0
                   :                               0
                   ;
        
        var event = new Ext.EventObjectImpl({
            type:     options.dblclick ? 'dblclick' : 'click',
            button:   button,
            ctrlKey:  options.ctrlKey,
            shiftKey: options.shiftKey,
            altKey:   options.altKey
        });
        
        event.injectEvent(target);
    },
    
    /*
     * @private Emulate keyboard event on target element
     *
     * @param {Ext.Element/HTMLElement} target Target element
     * @param {String} type Event type: keydown, keyup or keypress
     * @param {Int} code Key or character code
     * @param {Object} options    (optional)
     * @param {Bool}   .isKeyCode (optional) Specifies if code parameter was key or character.
     *                                       Default: character code.
     * @param {Bool}   .ctrlKey   (optional) Ctrl key is pressed along with main key. Default: false.
     * @param {Bool}   .shiftKey  (optional) Shift key is pressed. Default: false.
     * @param {Bool}   .altKey    (optional) Alt key is pressed. Default: false.
     * @param {Bool}   .metaKey   (optional) Meta key is pressed. Default: false.
     *
     */
    injectKeyEvent: function(target, type, code, options) {
        if ( !target ) {
            throw 'Ext.ux.Test.injectKeyEvent(): Target is required';
        };
        
        if ( type != 'keydown' && type != 'keyup' && type != 'keypress' ) {
            throw 'Ext.ux.Test.injectKeyEvent(): Event type should be keyup, keydown or keypress';
        };
        
        if ( target.$className != 'Ext.dom.Element' ) {
            target = new Ext.Element(target);
        };
        
        /*
         * The code below was shamelessly adapted from YUI 2.9.0 (UserAction.js)
         */
        
        options = options || {};
        
        var ctrlKey, shiftKey, metaKey, altKey, keyCode, charCode;
        
        ctrlKey  = Ext.isBoolean(options.ctrlKey)  ? options.ctrlKey  : false;
        shiftKey = Ext.isBoolean(options.shiftKey) ? options.shiftKey : false;
        metaKey  = Ext.isBoolean(options.metaKey)  ? options.metaKey  : false;
        altKey   = Ext.isBoolean(options.altKey)   ? options.altKey   : false;
        
        keyCode  = Ext.isIE          ? code
                 : options.isKeyCode ? code
                 :                     0
                 ;
        charCode = Ext.isIE          ? undefined
                 : options.isKeyCode ? 0
                 :                     code
                 ;
        
        if ( Ext.isFunction( document.createEvent ) ) {
            var event;
            
            /*
             * YUI implementation has some Mozilla specific code that didn't work for me.
             * The standards based approach below works for Mozilla too so I see no
             * reason to invent something more extravagant.
             */
            try {
                event = document.createEvent('Events');
            }
            catch (ee) {
                event = document.createEvent('UIEvents');
            }
            finally {
                event.initEvent(type, true, true);
                
                Ext.apply(event, {
                    view:     window,
                    ctrlKey:  ctrlKey,
                    shiftKey: shiftKey,
                    altKey:   altKey,
                    metaKey:  metaKey,
                    keyCode:  keyCode,
                    charCode: charCode
                });
            };
        
            target.dom.dispatchEvent(event);
        }
        else if ( Ext.isObject( document.createEventObject ) ) {    // MSIE < 9
            var event = document.createEventObject();
            
            Ext.apply(event, {
                bubbles:    true,
                cancelable: true,
                view:       window,
                ctrlKey:    ctrlKey,
                shiftKey:   shiftKey,
                metaKey:    metaKey,
                altKey:     altKey,
                keyCode:    code
            });
            
            target.dom.fireEvent('on' + type, event);
        }
        else {
            throw 'Ext.ux.Test.injectKeyEvent(): No event simulation framework';
        };
    },
    
    /*
     * Emulate mouse click event on a button
     * @param {Ext.button.Button} button The button to click on
     *
     */
    clickButton: function(button) {
        if ( !button || !Ext.isObject(button) || !button.isButton ) {
            throw 'Ext.ux.Test.clickButton(): Button object is invalid';
        };
        
        if ( !button.rendered ) {
            throw 'Ext.ux.Test.clickButton(): Button is not rendered';
        };
        
        Ext.ux.Test.injectMouseClick( button.getEl() );
    },
    
    /*
     * Emulate mouse click event on a check box
     * @param {Ext.form.field.Checkbox} cb Checkbox to click on
     *
     */
    clickCheckbox: function(cb) {
        if ( !cb || !Ext.isObject(cb) || !cb.isCheckbox ) {
            throw 'Ext.ux.Test.clickCheckbox(): Checkbox object is invalid';
        };
        
        if ( !cb.rendered ) {
            throw 'Ext.ux.Test.clickCheckbox(): Checkbox is not rendered';
        };
        
        Ext.ux.Test.injectMouseClick( cb.inputEl );
    },
    
    /*
     * Emulate mouse click event on a radio box
     * @param {Ext.form.field.Radio} rb Radio button to click on
     *
     */
    clickRadioButton: function(rb) {
        if ( !rb || !Ext.isObject(rb) || !rb.isRadio ) {
            throw 'Ext.ux.Test.clickRadioButton(): Radio object is invalid';
        };
        
        if ( !rb.rendered ) {
            throw 'Ext.ux.Test.clickRadioButton(): Radio button is not rendered';
        };
        
        Ext.ux.Test.injectMouseClick( rb.inputEl );
    },
    
    /*
     * @private Emulate pressing a key on a target element
     *
     * @param {Ext.Element/HTMLElement} target Target element
     * @param {Int} code Key code or character code
     * @param {Object} options    (optional)
     * @param {Bool}   .ctrlKey   (optional) Ctrl key is pressed along with main key. Default: false.
     * @param {Bool}   .shiftKey  (optional) Shift key is pressed. Default: false.
     * @param {Bool}   .altKey    (optional) Alt key is pressed. Default: false.
     * @param {Bool}   .metaKey   (optional) Meta key is pressed. Default: false.
     */
    simulateKey: function(target, code, options) {
        if ( !target ) {
            throw 'Ext.ux.Test.simulateKey(): Target is required';
        };
        
        if ( target.$className != 'Ext.dom.Element' ) {
            target = new Ext.Element(target);
        };
        
        options = options || {};
        
        Ext.ux.Test.injectKeyEvent(target, 'keydown',  code, options);
        Ext.ux.Test.injectKeyEvent(target, 'keypress', code, options);
        Ext.ux.Test.injectKeyEvent(target, 'keyup',    code, options);
        target.dom.value += String.fromCharCode(code);

        if ( options.fn ) {
            Ext.callback(options.fn, options.scope || Ext.global,
                         options.args || [], options.delay || 0);
        };
    },
    
    /*
     * Emulate typing text in a field. Note that text field will react to typing
     * with some delay, so allow for this delay before checking field value. 100 ms
     * will typically be enough.
     *
     * @param {Ext.form.field.Base} field The field to type in
     * @param {String} text Text to type in the field
     * @param {Object} options     (optional)
     * @param {Function} .fn       (optional) Function to call when typing is finished
     * @param {Array}    .args     (optional) Array of parameters to pass to the function
     * @param {Int}      .delay    (optional) Delay in ms to wait after typing but before calling fn
     * @param {Object}   .scope    (optional) Callback function scope
     * @param {Bool}     .ctrlKey  (optional) Control key is pressed along with typing text.
     *                                        Default: false.
     * @param {Bool}     .shiftKey (optional) Shift key is pressed along with typing text.
     *                                        Default: false.
     * @param {Bool}     .metaKey  (optional) Meta key is pressed along with typing text.
     *                                        Default: false.
     * @param {Bool}     .altKey   (optional) Alt key is pressed along with typing text.
     *                                        Default: false.
     *
     */
    typeText: function(field, text, options) {
        if ( !field || !Ext.isObject(field) || !field.isFormField ) {
            throw 'Ext.ux.Test.typeText(): Field object is invalid';
        };
        
        if ( !field.rendered ) {
            throw 'Ext.ux.Test.typeText(): Field is not rendered';
        };
        
        options = options || {};
        
        var el = field.inputEl;
        
        for ( var i = 0, l = text.length; i < l; i++ ) {
            var chr = text.charCodeAt(i);
            
            Ext.ux.Test.simulateKey(el, chr, options);
        };
        
        if ( options.fn ) {
            Ext.callback(options.fn, options.scope || Ext.global,
                         options.args || [], options.delay || 0);
        };
    },
    
    /*
     * Emulate pressing a special key in a Component.
     *
     * @param {Ext.Component} target Target Component
     * @param {Int} code Keyboard code
     * @param {Object} options     (optional)
     * @param {Function} .fn       (optional) Function to call when typing is finished
     * @param {Array}    .args     (optional) Array of parameters to pass to the function
     * @param {Int}      .delay    (optional) Delay in ms to wait after typing but before calling fn
     * @param {Object}   .scope    (optional) Callback function scope
     * @param {Bool}     .ctrlKey  (optional) Ctrl key is pressed along with main key. Default: false.
     * @param {Bool}     .shiftKey (optional) Shift key is pressed. Default: false.
     * @param {Bool}     .altKey   (optional) Alt key is pressed. Default: false.
     * @param {Bool}     .metaKey  (optional) Meta key is pressed. Default: false.
     */
    enterSpecialKey: function(target, code, options) {
        if ( !target || !Ext.isObject(target) || !target.isComponent || !target.rendered ) {
            return;
        };
        
        var el = target.getEl();
        
        Ext.ux.Test.simulateKey(el, code, options);
    },
    
    /*
     * Emulate pressing Enter in a Component. Some examples of Components that accept
     * keyboard input are: form fields, buttons, menu items.
     *
     * @param {Ext.Component} target Target Component
     * @param {Object} options     (optional)
     * @param {Function} .fn       (optional) Function to call when typing is finished
     * @param {Array}    .args     (optional) Array of parameters to pass to the function
     * @param {Int}      .delay    (optional) Delay in ms to wait after typing but before calling fn
     * @param {Object}   .scope    (optional) Callback function scope
     * @param {Bool}     .ctrlKey  (optional) Ctrl key is pressed along with main key. Default: false.
     * @param {Bool}     .shiftKey (optional) Shift key is pressed. Default: false.
     * @param {Bool}     .altKey   (optional) Alt key is pressed. Default: false.
     * @param {Bool}     .metaKey  (optional) Meta key is pressed. Default: false.
     */
    pressEnter: function(target, options) {
        Ext.ux.Test.enterSpecialKey(target, Ext.EventObject.ENTER, options);
    },
    
    /*
     * Emulate pressing Escape in a Component.
     *
     * @param {Ext.Component} target Target Component
     * @param {Object} options     (optional)
     * @param {Function} .fn       (optional) Function to call when typing is finished
     * @param {Array}    .args     (optional) Array of parameters to pass to the function
     * @param {Int}      .delay    (optional) Delay in ms to wait after typing but before calling fn
     * @param {Object}   .scope    (optional) Callback function scope
     * @param {Bool}     .ctrlKey  (optional) Ctrl key is pressed along with main key. Default: false.
     * @param {Bool}     .shiftKey (optional) Shift key is pressed. Default: false.
     * @param {Bool}     .altKey   (optional) Alt key is pressed. Default: false.
     * @param {Bool}     .metaKey  (optional) Meta key is pressed. Default: false.
     */
    pressEscape: function(target, options) {
        Ext.ux.Test.enterSpecialKey(target, Ext.EventObject.ESC, options);
    },

    /*
     * @private Look up key code by key name
     */
    keyNameToCode: function(key) {
        var normalized = {
            ESCAPE: 'ESC', BACK: 'BACKSPACE', BACKSP: 'BACKSPACE',
            DEL: 'DELETE', INS: 'INSERT', CAPS: 'CAPS_LOCK',
            CAPSLOCK: 'CAPS_LOCK', PGUP: 'PAGE_UP', PAGEUP: 'PAGE_UP',
            PGDN: 'PAGE_DOWN', PAGEDOWN: 'PAGE_DOWN', PAGEDN: 'PAGE_DOWN',
            PRINTSCREEN: 'PRINT_SCREEN', PRTSCR: 'PRINT_SCREEN',
            PRTSC: 'PRINT_SCREEN'
        };
        
        key = key.toUpperCase();
        
        return normalized[key] ? Ext.EventObject[ normalized[key] ]
             :                   Ext.EventObject[ key ]
             ;
    },
    
    /*
     * Emulate pressing a special key in a Component.
     *
     * @param {Ext.Component} target Target Component
     * @param {String} key Key name (Enter, Esc, Left, Right etc)
     * @param {Object} options     (optional)
     * @param {Function} .fn       (optional) Function to call when typing is finished
     * @param {Array}    .args     (optional) Array of parameters to pass to the function
     * @param {Int}      .delay    (optional) Delay in ms to wait after typing but before calling fn
     * @param {Object}   .scope    (optional) Callback function scope
     * @param {Bool}     .ctrlKey  (optional) Ctrl key is pressed along with main key. Default: false.
     * @param {Bool}     .shiftKey (optional) Shift key is pressed. Default: false.
     * @param {Bool}     .altKey   (optional) Alt key is pressed. Default: false.
     * @param {Bool}     .metaKey  (optional) Meta key is pressed. Default: false.
     */
    pressSpecialKey: function(target, key, options) {
        var keyCode = Ext.ux.Test.keyNameToCode(key);
        
        Ext.ux.Test.enterSpecialKey(target, keyCode, options);
    },
    
    /*
     * Return top (latest) MsgBox
     *
     * @param {Int} order (optional) Order number of the desired MsgBox. Default: last shown.
     * @returns {Ext.window.MessageBox}
     */
    getMsgBox: function(order) {
    
        // MessageBox windows have x-message-box class
        var boxes = Ext.query('.x-message-box');
        
        if ( !boxes.length ) return;
        
        var el = boxes[ boxes.length - 1 ];
        
        if ( !el ) return;
        
        var msgbox = Ext.getCmp( el.getAttribute('id') );
        
        return msgbox;
    },
    
    /*
     * Return top MsgBox title
     *
     * @param {Ext.window.MessageBox} box (optional) MsgBox to return title for.
     */
    getMsgBoxTitle: function(box) {
        var msgbox = box || Ext.ux.Test.getMsgBox();
        
        if ( !msgbox ) return;
        
        return msgbox.title;
    },
    
    /*
     * Return top MsgBox message string
     *
     * @param {Ext.window.MessageBox} box (optional) MsgBox to return message for.
     */
    getMsgBoxMessage: function(box) {
        var msgbox = box || Ext.ux.Test.getMsgBox();
        
        if ( !msgbox ) return;
        
        return msgbox.msg.getValue();
    },
    
    /*
     * Close top MsgBox
     *
     * @param {Ext.window.MessageBox} box (optional) MsgBox to close.
     */
    closeMsgBox: function(box) {
        var msgbox = box || Ext.ux.Test.getMsgBox();
        
        if ( msgbox ) {
            msgbox.close();
        };
    },
    
    /*
     * Click specified MsgBox button
     *
     * @param {String} name Button name.
     * @param {Ext.window.MessageBox} box (optional) MsgBox to close.
     */
    clickMsgBoxButton: function(name, box) {
        var msgbox = box || Ext.ux.Test.getMsgBox();
        
        if ( !msgbox ) return;
        
        var button = msgbox.msgButtons[name];
        
        if ( button ) {
            Ext.ux.Test.clickButton(button);
        };
    },
    
    /*
     * Click OK button in MsgBox
     *
     * @param {Ext.window.MessageBox} box (optional) MsgBox to click button in.
     */
    clickOkMsgBox: function(box) {
        Ext.ux.Test.clickMsgBoxButton('ok', box);
    },
    
    /*
     * Click Cancel button in MsgBox
     *
     * @param {Ext.window.MessageBox} box (optional) MsgBox to click button in.
     */
    clickCancelMsgBox: function(box) {
        Ext.ux.Test.clickMsgBoxButton('cancel', box);
    },
    
    /*
     * Click Yes button in MsgBox
     *
     * @param {Ext.window.MessageBox} box (optional) MsgBox to click button in.
     */
    clickYesMsgBox: function(box) {
        Ext.ux.Test.clickMsgBoxButton('yes', box);
    },
    
    /*
     * Click No button in MsgBox
     *
     * @param {Ext.window.MessageBox} box (optional) MsgBox to click button in.
     */
    clickNoMsgBox: function(box) {
        Ext.ux.Test.clickMsgBoxButton('no', box);
    },
    
    /*
     * Type text in MsgBox prompt
     *
     * @param {String} text Text to type
     * @param {Object} options     (optional)
     * @param {Function} .fn       (optional) Function to call when typing is finished
     * @param {Array}    .args     (optional) Array of parameters to pass to the function
     * @param {Int}      .delay    (optional) Delay in ms to wait after typing but before calling fn
     * @param {Object}   .scope    (optional) Callback function scope
     * @param {Bool}     .ctrlKey  (optional) Control key is pressed along with typing text.
     *                                        Default: false.
     * @param {Bool}     .shiftKey (optional) Shift key is pressed along with typing text.
     *                                        Default: false.
     * @param {Bool}     .metaKey  (optional) Meta key is pressed along with typing text.
     *                                        Default: false.
     * @param {Bool}     .altKey   (optional) Alt key is pressed along with typing text.
     *                                        Default: false.
     * @param {Ext.window.MessageBox} box (optional) MsgBox to type in.
     *
     */
    typeInMsgBoxPrompt: function(text, options, box) {
        var msgbox = Ext.ux.Test.getMsgBox();
        
        if ( !msgbox ) return;
        
        var field = msgbox.multiline ? msgbox.textArea
                  :                    msgbox.textField
                  ;
        
        Ext.ux.Test.typeText(field, text, options);
    }
});
