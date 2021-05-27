const createWindow = (function() {
    const minHeight = 24;
    const minWidth = 192;
    const handleSize = 4;

    const style = document.createElement("style");

    style.innerHTML = `\
    .win {
        position: absolute;

        top: 0;
        left: 0;

        display: flex;
        flex-direction: column;

        border: 1px solid #111;
        border-radius: 4px;

        background-color: #eee;

        min-width: ${minWidth}px;
        min-height: ${minHeight}px;

        z-index: 10;
    }

    .win-container {
        display: flex;
        flex-direction: column;

        flex: 1;

        overflow: hidden;
    }

    .win-header {
        flex-shrink: 0;

        display: flex;
        align-items: center;
        justify-content: space-between;

        height: 1.5rem;
    }

    .win-content {
        flex: 1;

        border-radius: 4px;

        background-color: white;

        margin: 0 0.25rem 0.25rem 0.25rem;
    }

    .win-title {
        overflow: hidden;
        text-overflow: ellipsis;

        user-select: none;

        cursor: move;

        flex: 1;

        padding: 0.5rem 0;

        font-family: sans-serif;
        font-weight: 400;
        font-size: 0.9rem;

        text-align: center;
    }

    .win-icon {
        width: 16px;
        height: 16px;

        margin-left: 0.25rem;

        user-select: none;

        display: grid;
        place-items: center;
    }

    .trigger {
        position: absolute;

        z-index: 10;
    }

    .r {
        top: 0;
        right: -${handleSize / 2}px;
        bottom: 0;
        width: ${handleSize}px;
        cursor: col-resize;
    }

    .l {
        top: 0;
        left: -${handleSize / 2}px;
        bottom: 0;
        width: ${handleSize}px;
        cursor: col-resize;
    }

    .t {
        top: -${handleSize / 2}px;
        left: 0;
        right: 0;
        height: ${handleSize}px;
        cursor: row-resize;
    }

    .b {
        bottom: -${handleSize / 2}px;
        left: 0;
        right: 0;
        height: ${handleSize}px;
        cursor: row-resize;
    }

    .tr {
        top: -${handleSize * 1.5 / 2}px;
        right: -${handleSize * 1.5 / 2}px;
        width: ${handleSize * 1.5}px;
        height: ${handleSize * 1.5}px;
        cursor: nesw-resize;
    }

    .tl {
        top: -${handleSize * 1.5 / 2}px;
        left: -${handleSize * 1.5 / 2}px;
        width: ${handleSize * 1.5}px;
        height: ${handleSize * 1.5}px;
        cursor: nwse-resize;
    }

    .br {
        bottom: -${handleSize * 1.5 / 2}px;
        right: -${handleSize * 1.5 / 2}px;
        width: ${handleSize * 1.5}px;
        height: ${handleSize * 1.5}px;
        cursor: nwse-resize;
    }

    .bl {
        bottom: -${handleSize * 1.5 / 2}px;
        left: -${handleSize * 1.5 / 2}px;
        width: ${handleSize * 1.5}px;
        height: ${handleSize * 1.5}px;
        cursor: nesw-resize;
    }

    .win-menu {
        display: flex;
        align-items: center;

        gap: 0.25rem;

        margin: 0 0.25rem;
    }

    .win-menu > button {
        border: none;
        outline: none;

        width: 12px;
        height: 12px;

        border-radius: 50%;

        cursor: pointer;
    }

    .win-min {
        background: orange;
    }

    .win-max {
        background: limegreen;
    }

    .win-close {
        background: red;
    }`;

    document.head.appendChild(style);

    return function createWindow(options?: {
        icon?: string | number | bigint | HTMLElement;
        title?: string;
        content?: string | number | bigint | HTMLElement;
        button?: HTMLElement;
    }) {
        const icon = options && typeof options.icon !== "undefined" ? options.icon : "i";

        const title = options && typeof options.title === "string" ? options.title : "window";

        const content = options && typeof options.content !== "undefined" ? options.content : "";

        const button = options && options.button instanceof HTMLElement ? options.button : new DOMParser().parseFromString(
            `<button>Click to toggle window</button>`,
            "text/html",
        ).body.childNodes[0] as HTMLButtonElement;

        const win = new DOMParser().parseFromString(`\
        <section class="win">
            <article class="win-container">
                <header class="win-header">
                    <i class="win-icon"></i>
                    <h4 class="win-title"></h4>
                    <nav class="win-menu">
                        <button class="win-min"></button>
                        <button class="win-max"></button>
                        <button class="win-close"></button>
                    </nav>
                </header>
                <main class="win-content"></main>
            </article>
            <div class="trigger r"></div>
            <div class="trigger l"></div>
            <div class="trigger t"></div>
            <div class="trigger b"></div>
            <div class="trigger tr"></div>
            <div class="trigger tl"></div>
            <div class="trigger br"></div>
            <div class="trigger bl"></div>
        </section>`, "text/html").body.childNodes[0] as HTMLElement;

        win.querySelector(".win-icon")!.append(icon instanceof HTMLElement ? icon : icon.toString());

        win.querySelector(".win-title")!.textContent = title;

        win.querySelector(".win-content")!.append(content instanceof HTMLElement ? content : content.toString());

        if (!content) win.style.height = 24 + "px";

        const isMax = {
            isMax: false,
            w: "",
            h: "",
            x: "",
            y: "",
        };

        const isMin = {
            isMin: false,
            w: 0,
            h: 0,
            x: 0,
            y: 0,
        };

        const isDragging = {
            title: false,
            r: false,
            l: false,
            t: false,
            b: false,
        };

        const last = {
            title: {
                x: 0,
                y: 0,
            },
            l: {
                x: 0,
                y: 0,
                l: 0,
                w: 0,
            },
            t: {
                x: 0,
                y: 0,
                t: 0,
                h: 0,
            },
        };

        const reset = () => {
            isDragging.title = false;
            isDragging.r = false;
            isDragging.l = false;
            isDragging.t = false;
            isDragging.b = false;

            last.title.x = 0;
            last.title.y = 0;

            last.l.x = 0;
            last.l.y = 0;
            last.l.l = 0;
            last.l.w = 0;

            last.t.x = 0;
            last.t.y = 0;
            last.t.t = 0;
            last.t.h = 0;
        };

        const dragTitle = (e: MouseEvent) => {
            if (isDragging.title) {
                if (!last.title.x || !last.title.y) {
                    last.title.x = e.clientX;
                    last.title.y = e.clientY;
                }

                const {
                    top,
                    left
                } = win.getBoundingClientRect();

                win.style.left = Math.max(left + e.clientX - last.title.x, 0) + "px";
                win.style.top = Math.max(top + e.clientY - last.title.y, 0) + "px";

                last.title.x = e.clientX;
                last.title.y = e.clientY;
            }
        }

        const drag = (e: MouseEvent) => {
            dragTitle(e);

            if (isDragging.r) {
                const rect = win.getBoundingClientRect();

                const w = e.clientX - rect.left;

                win.style.width = w + "px";
            }

            if (isDragging.l) {
                const rect = win.getBoundingClientRect();

                if (!last.l.x || !last.l.y) {
                    last.l.x = e.clientX;
                    last.l.y = e.clientY;
                    last.l.l = rect.left;
                    last.l.w = parseInt(window.getComputedStyle(win).width);
                }

                const l = Math.max(rect.left + e.clientX - last.l.x, 0);
                const w = Math.max(last.l.l + last.l.w - l, minWidth);

                if (l < l + w - minWidth) {
                    last.l.x = e.clientX;
                    last.l.y = e.clientY;

                    win.style.left = l + "px";
                    win.style.width = w + "px";
                }
            }

            if (isDragging.t) {
                const rect = win.getBoundingClientRect();

                if (!last.t.x || !last.t.y) {
                    last.t.x = e.clientX;
                    last.t.y = e.clientY;
                    last.t.t = rect.top;
                    last.t.h = parseInt(window.getComputedStyle(win).height);
                }

                const t = Math.max(rect.top + e.clientY - last.t.y, 0);
                const h = Math.max(last.t.t + last.t.h - t, minHeight);

                if (t < t + h - minHeight) {
                    last.t.x = e.clientX;
                    last.t.y = e.clientY;

                    win.style.top = t + "px";
                    win.style.height = h + "px";
                }
            }

            if (isDragging.b) {
                const rect = win.getBoundingClientRect();

                const h = e.clientY - rect.top;

                win.style.height = h + "px";
            }
        };

        document.addEventListener("click", reset);

        document.addEventListener("mouseleave", reset);

        document.addEventListener("mouseup", reset);

        document.addEventListener("mousemove", drag);

        win.querySelector(".win-title")!.addEventListener("mousedown", () => {
            isDragging.title = true;
        });

        win.querySelector(".win-title")!.addEventListener("mouseup", () => {
            isDragging.title = false;

            last.title.x = 0;
            last.title.y = 0;
        });

        (win.querySelector(".win-title") as HTMLHeadingElement).addEventListener("mousemove", dragTitle);

        button.addEventListener("click", () => {
            if (isMin.isMin) {
                isMin.isMin = false;

                win.style.display = "flex";

                return;
            }

            isMin.isMin = true;

            win.style.display = "none";

            return;
        });

        win.querySelector(".win-min")!.addEventListener("click", () => {
            if (isMin.isMin) {
                isMin.isMin = false;

                win.style.display = "flex";

                return;
            }

            isMin.isMin = true;

            win.style.display = "none";

            return;
        });

        win.querySelector(".win-max")!.addEventListener("click", () => {
            if (isMax.isMax) {
                isMax.isMax = false;

                win.style.top = isMax.y;
                win.style.left = isMax.x;

                win.style.width = isMax.w;
                win.style.height = isMax.h;

                win.style.minWidth = "unset";
                win.style.minHeight = "unset";

                return;
            }

            isMax.isMax = true;

            const styles = window.getComputedStyle(win);

            isMax.w = styles.width;
            isMax.h = styles.height;
            isMax.x = styles.left;
            isMax.y = styles.top;

            win.style.minWidth = "100vw";
            win.style.minHeight = "100vh";

            win.style.top = "0px";
            win.style.left = "0px";

            return;
        });

        win.querySelector(".win-close")!.addEventListener("click", () => {
            win.remove();

            button.remove();

            document.removeEventListener("click", reset);

            document.removeEventListener("mouseleave", reset);

            document.removeEventListener("mouseup", reset);

            document.removeEventListener("mousemove", drag);

            return;
        });

        win.querySelector(".trigger.r")!.addEventListener("mousedown", () => {
            isDragging.r = true;
        });

        win.querySelector(".trigger.l")!.addEventListener("mousedown", () => {
            isDragging.l = true;
        });

        win.querySelector(".trigger.t")!.addEventListener("mousedown", () => {
            isDragging.t = true;
        });

        win.querySelector(".trigger.b")!.addEventListener("mousedown", () => {
            isDragging.b = true;
        });

        win.querySelector(".trigger.tr")!.addEventListener("mousedown", () => {
            isDragging.t = true;
            isDragging.r = true;
        });

        win.querySelector(".trigger.tl")!.addEventListener("mousedown", () => {
            isDragging.t = true;
            isDragging.l = true;
        });

        win.querySelector(".trigger.br")!.addEventListener("mousedown", () => {
            isDragging.b = true;
            isDragging.r = true;
        });

        win.querySelector(".trigger.bl")!.addEventListener("mousedown", () => {
            isDragging.b = true;
            isDragging.l = true;
        });

        return [win, button] as [HTMLElement, HTMLButtonElement];
    }
})();
