
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function select_option(select, value, mounting) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        if (!mounting || value !== undefined) {
            select.selectedIndex = -1; // no option should be selected
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked');
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.59.2' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/App.svelte generated by Svelte v3.59.2 */

    const file = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (62:16) {:else}
    function create_else_block(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = /*product*/ ctx[1].imageURL)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "img-fluid p-2");
    			add_location(img, file, 62, 18, 1295);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*products*/ 1 && !src_url_equal(img.src, img_src_value = /*product*/ ctx[1].imageURL)) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(62:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (56:16) {#if !product.imageURL}
    function create_if_block(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "images/no_product.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "img-fluid p-2");
    			add_location(img, file, 56, 18, 1110);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(56:16) {#if !product.imageURL}",
    		ctx
    	});

    	return block;
    }

    // (52:8) {#each products as product}
    function create_each_block(ctx) {
    	let div4;
    	let div3;
    	let div0;
    	let t0;
    	let div2;
    	let div1;
    	let h5;
    	let strong;
    	let t1_value = /*product*/ ctx[1].name + "";
    	let t1;
    	let t2;
    	let span;
    	let small;
    	let t3_value = /*product*/ ctx[1].category + "";
    	let t3;
    	let t4;
    	let p;
    	let t5_value = /*product*/ ctx[1].decription + "";
    	let t5;
    	let t6;
    	let button0;
    	let t8;
    	let button1;
    	let t10;

    	function select_block_type(ctx, dirty) {
    		if (!/*product*/ ctx[1].imageURL) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			if_block.c();
    			t0 = space();
    			div2 = element("div");
    			div1 = element("div");
    			h5 = element("h5");
    			strong = element("strong");
    			t1 = text(t1_value);
    			t2 = space();
    			span = element("span");
    			small = element("small");
    			t3 = text(t3_value);
    			t4 = space();
    			p = element("p");
    			t5 = text(t5_value);
    			t6 = space();
    			button0 = element("button");
    			button0.textContent = "Delete";
    			t8 = space();
    			button1 = element("button");
    			button1.textContent = "Edit";
    			t10 = space();
    			attr_dev(div0, "class", "col-md-4");
    			add_location(div0, file, 54, 14, 1029);
    			add_location(strong, file, 68, 20, 1518);
    			add_location(small, file, 72, 22, 1643);
    			add_location(span, file, 71, 20, 1614);
    			add_location(h5, file, 67, 18, 1493);
    			attr_dev(p, "class", "card-text");
    			add_location(p, file, 75, 18, 1747);
    			attr_dev(button0, "class", "btn btn-danger");
    			add_location(button0, file, 76, 18, 1811);
    			attr_dev(button1, "class", "btn btn-secondary");
    			add_location(button1, file, 77, 18, 1876);
    			attr_dev(div1, "class", "card-body");
    			add_location(div1, file, 66, 16, 1451);
    			attr_dev(div2, "class", "col-md-8");
    			add_location(div2, file, 65, 14, 1412);
    			attr_dev(div3, "class", "row");
    			add_location(div3, file, 53, 12, 997);
    			attr_dev(div4, "class", "card mt-2");
    			add_location(div4, file, 52, 10, 961);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, div0);
    			if_block.m(div0, null);
    			append_dev(div3, t0);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, h5);
    			append_dev(h5, strong);
    			append_dev(strong, t1);
    			append_dev(h5, t2);
    			append_dev(h5, span);
    			append_dev(span, small);
    			append_dev(small, t3);
    			append_dev(div1, t4);
    			append_dev(div1, p);
    			append_dev(p, t5);
    			append_dev(div1, t6);
    			append_dev(div1, button0);
    			append_dev(div1, t8);
    			append_dev(div1, button1);
    			append_dev(div4, t10);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			}

    			if (dirty & /*products*/ 1 && t1_value !== (t1_value = /*product*/ ctx[1].name + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*products*/ 1 && t3_value !== (t3_value = /*product*/ ctx[1].category + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*products*/ 1 && t5_value !== (t5_value = /*product*/ ctx[1].decription + "")) set_data_dev(t5, t5_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(52:8) {#each products as product}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let div9;
    	let div8;
    	let div0;
    	let t0;
    	let div7;
    	let div6;
    	let div5;
    	let form;
    	let div1;
    	let input0;
    	let t1;
    	let div2;
    	let textarea;
    	let t2;
    	let div3;
    	let input1;
    	let t3;
    	let div4;
    	let select;
    	let option0;
    	let option1;
    	let option2;
    	let t7;
    	let button;
    	let mounted;
    	let dispose;
    	let each_value = /*products*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			div9 = element("div");
    			div8 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			div7 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			form = element("form");
    			div1 = element("div");
    			input0 = element("input");
    			t1 = space();
    			div2 = element("div");
    			textarea = element("textarea");
    			t2 = space();
    			div3 = element("div");
    			input1 = element("input");
    			t3 = space();
    			div4 = element("div");
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "Laptops";
    			option1 = element("option");
    			option1.textContent = "Peripherials";
    			option2 = element("option");
    			option2.textContent = "Servers";
    			t7 = space();
    			button = element("button");
    			button.textContent = "Save Product";
    			attr_dev(div0, "class", "col-md-6");
    			add_location(div0, file, 50, 6, 892);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "Product Name");
    			attr_dev(input0, "name", "");
    			attr_dev(input0, "id", "product-name");
    			attr_dev(input0, "class", "form-control");
    			add_location(input0, file, 89, 16, 2240);
    			attr_dev(div1, "class", "form-group");
    			add_location(div1, file, 88, 14, 2199);
    			attr_dev(textarea, "id", "product-description");
    			attr_dev(textarea, "placeholder", "Product Description");
    			attr_dev(textarea, "rows", "3");
    			attr_dev(textarea, "class", "form-control");
    			add_location(textarea, file, 99, 16, 2559);
    			attr_dev(div2, "class", "form-group");
    			add_location(div2, file, 98, 14, 2518);
    			attr_dev(input1, "type", "url");
    			attr_dev(input1, "id", "product-image-url");
    			attr_dev(input1, "placeholder", "https://faztweb.com/");
    			attr_dev(input1, "class", "form-control");
    			add_location(input1, file, 108, 16, 2885);
    			attr_dev(div3, "class", "form-group");
    			add_location(div3, file, 107, 14, 2844);
    			option0.__value = "laptops";
    			option0.value = option0.__value;
    			add_location(option0, file, 123, 18, 3361);
    			option1.__value = "peripherials";
    			option1.value = option1.__value;
    			add_location(option1, file, 124, 18, 3420);
    			option2.__value = "servers";
    			option2.value = option2.__value;
    			add_location(option2, file, 125, 18, 3489);
    			attr_dev(select, "id", "category");
    			attr_dev(select, "class", "form-control");
    			if (/*product*/ ctx[1].category === void 0) add_render_callback(() => /*select_change_handler*/ ctx[6].call(select));
    			add_location(select, file, 118, 16, 3198);
    			attr_dev(div4, "class", "form-group");
    			add_location(div4, file, 117, 14, 3157);
    			attr_dev(button, "class", "btn btn-secondary");
    			add_location(button, file, 129, 14, 3592);
    			add_location(form, file, 87, 12, 2135);
    			attr_dev(div5, "class", "card-body");
    			add_location(div5, file, 86, 10, 2099);
    			attr_dev(div6, "class", "card");
    			add_location(div6, file, 85, 8, 2070);
    			attr_dev(div7, "class", "col-md-6");
    			add_location(div7, file, 84, 6, 2039);
    			attr_dev(div8, "class", "row");
    			add_location(div8, file, 49, 4, 868);
    			attr_dev(div9, "class", "container");
    			add_location(div9, file, 48, 2, 840);
    			add_location(main, file, 47, 0, 831);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div9);
    			append_dev(div9, div8);
    			append_dev(div8, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div0, null);
    				}
    			}

    			append_dev(div8, t0);
    			append_dev(div8, div7);
    			append_dev(div7, div6);
    			append_dev(div6, div5);
    			append_dev(div5, form);
    			append_dev(form, div1);
    			append_dev(div1, input0);
    			set_input_value(input0, /*product*/ ctx[1].name);
    			append_dev(form, t1);
    			append_dev(form, div2);
    			append_dev(div2, textarea);
    			set_input_value(textarea, /*product*/ ctx[1].decription);
    			append_dev(form, t2);
    			append_dev(form, div3);
    			append_dev(div3, input1);
    			set_input_value(input1, /*product*/ ctx[1].imageURL);
    			append_dev(form, t3);
    			append_dev(form, div4);
    			append_dev(div4, select);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			append_dev(select, option2);
    			select_option(select, /*product*/ ctx[1].category, true);
    			append_dev(form, t7);
    			append_dev(form, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[3]),
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[4]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[5]),
    					listen_dev(select, "change", /*select_change_handler*/ ctx[6]),
    					listen_dev(form, "submit", prevent_default(/*onSubmitHandler*/ ctx[2]), false, true, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*products*/ 1) {
    				each_value = /*products*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*product*/ 2 && input0.value !== /*product*/ ctx[1].name) {
    				set_input_value(input0, /*product*/ ctx[1].name);
    			}

    			if (dirty & /*product*/ 2) {
    				set_input_value(textarea, /*product*/ ctx[1].decription);
    			}

    			if (dirty & /*product*/ 2 && input1.value !== /*product*/ ctx[1].imageURL) {
    				set_input_value(input1, /*product*/ ctx[1].imageURL);
    			}

    			if (dirty & /*product*/ 2) {
    				select_option(select, /*product*/ ctx[1].category);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);

    	let products = [
    		{
    			id: 1,
    			name: "HP Pavilion",
    			decription: "Laptop for house",
    			category: "laptop"
    		},
    		{
    			id: 2,
    			name: "Mouse Razer",
    			decription: "Gaming Mouse",
    			category: "peripherials"
    		}
    	];

    	let product = {
    		id: "",
    		name: "",
    		decription: "",
    		category: "",
    		imageURL: ""
    	};

    	const cleanProduct = () => {
    		$$invalidate(1, product = {
    			id: "",
    			name: "",
    			decription: "",
    			category: "",
    			imageURL: ""
    		});
    	};

    	const onSubmitHandler = e => {
    		const newProduct = {
    			id: product.name,
    			name: product.name,
    			decription: product.decription,
    			category: product.category,
    			imageURL: product.imageURL
    		};

    		$$invalidate(0, products = products.concat(newProduct));
    		cleanProduct();
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		product.name = this.value;
    		$$invalidate(1, product);
    	}

    	function textarea_input_handler() {
    		product.decription = this.value;
    		$$invalidate(1, product);
    	}

    	function input1_input_handler() {
    		product.imageURL = this.value;
    		$$invalidate(1, product);
    	}

    	function select_change_handler() {
    		product.category = select_value(this);
    		$$invalidate(1, product);
    	}

    	$$self.$capture_state = () => ({
    		products,
    		product,
    		cleanProduct,
    		onSubmitHandler
    	});

    	$$self.$inject_state = $$props => {
    		if ('products' in $$props) $$invalidate(0, products = $$props.products);
    		if ('product' in $$props) $$invalidate(1, product = $$props.product);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		products,
    		product,
    		onSubmitHandler,
    		input0_input_handler,
    		textarea_input_handler,
    		input1_input_handler,
    		select_change_handler
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
