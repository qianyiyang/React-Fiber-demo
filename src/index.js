// import React from "react";
// import ReactDOM from "react-dom";

// const element = (
//     <div id='A1'>
//         <div id='B1' className='B1'>
//             <div id='C1'></div>
//             <div id='C2'></div>
//         </div>
//         <div id='B2' className='B2'>
//         </div>
//     </div>
// );

// console.log(JSON.stringify(element, null, 2));

// function render(element, parentDom) {
//     const dom = document.createElement(element.type);

//     Object.keys(element.props)
//         .filter((ele) => ele !== "children")
//         .forEach((item) => {
//             dom[item] = element.props[item];
//         });

//     if (Array.isArray(element.props.children)) {
//         element.props.children.forEach((item) => render(item, dom));
//     } else if (
//         element.props.children &&
//         Object.keys(element.props.children).length !== 0
//     ) {
//         render(element.props.children, dom);
//     }

//     parentDom.appendChild(dom);
// }

// render(element, document.getElementById("root"));
// ReactDOM.render(routeArr(), document.getElementById("root"));

import element from "./element";

let container = document.getElementById("root");

// 根节点
let workInProgressRoot = {
    stateNode: container, // 此fiber对应的dom节点
    props: {
        children: [element],
    },
};

// 下一个工作单元
let nextUnitOfWork = workInProgressRoot;

function workLoop() {
    // 存在下一个工作单元时执行,并返回下一个工作单元
    while (nextUnitOfWork) {
        nextUnitOfWork = performanceUnitOfWork(nextUnitOfWork);
    }

    if (!nextUnitOfWork) {
        commitRoot();
    }
}

// 插入页面
function commitRoot() {
    let currentFiber = workInProgressRoot.firstEffect;

    while (currentFiber) {
        if (currentFiber.effectTag === "PLACEMENT") {
            currentFiber.return.stateNode.appendChild(currentFiber.stateNode);
        }

        currentFiber = currentFiber.nextEffect;
    }

    workInProgressRoot = null;
}

/**
 *
 * @param {*} workInProgressFiber
 */
function performanceUnitOfWork(workInProgressFiber) {
    // 1. 创建真实DOM,并没有挂载  2. 创建fiber树
    beginWork(workInProgressFiber);

    if (workInProgressFiber.child) {
        return workInProgressFiber.child;
    }

    while (workInProgressFiber) {
        // 如果没有儿子,当前节点其实已经结束了
        completeUnitOfWork(workInProgressFiber);
        if (workInProgressFiber.sibling) {
            return workInProgressFiber.sibling;
        }

        workInProgressFiber = workInProgressFiber.return;
    }
}

function beginWork(workInProgressFiber) {
    console.log("beginWork", workInProgressFiber.props.id);

    // 只创建元素,不挂载
    if (!workInProgressFiber.stateNode) {
        workInProgressFiber.stateNode = document.createElement(
            workInProgressFiber.type
        );

        for (let key in workInProgressFiber.props) {
            if (key !== "children") {
                workInProgressFiber.stateNode[key] =
                    workInProgressFiber.props[key];
            }
        }
    }

    // 创建子fiber
    let prevFiber;
    if (Array.isArray(workInProgressFiber.props.children)) {
        workInProgressFiber.props.children.forEach((item, index) => {
            let childFiber = {
                type: item.type,
                props: item.props,
                return: workInProgressFiber,
                effectTag: "PLACEMENT", // 标记，表示对应DOM需要被插入到页面
            };

            // 第一个子节点
            if (index === 0) {
                workInProgressFiber.child = childFiber;
            } else {
                prevFiber.sibling = childFiber;
            }

            prevFiber = childFiber;
        });
    }
}

function completeUnitOfWork(workInProgressFiber) {
    console.log("completeUnitOfWork", workInProgressFiber.props.id);
    // 构建副作用
    let returnFiber = workInProgressFiber.return; // 父节点

    if (returnFiber) {
        // 把当前fiber的有副作用子链表挂载到父节点
        if (!returnFiber.firstEffect) {
            returnFiber.firstEffect = workInProgressFiber.firstEffect;
        }

        if (workInProgressFiber.lastEffect) {
            if (returnFiber.lastEffect) {
                returnFiber.lastEffect.nextEffect =
                    workInProgressFiber.firstEffect;
            }

            returnFiber.lastEffect = workInProgressFiber.lastEffect;
        }

        // 挂载自己
        if (workInProgressFiber.effectTag) {
            if (returnFiber.lastEffect) {
                returnFiber.lastEffect.nextEffect = workInProgressFiber;
            } else {
                returnFiber.firstEffect = workInProgressFiber;
            }
            returnFiber.lastEffect = workInProgressFiber;
        }
    }
}

// 浏览器空闲时执行
requestIdleCallback(workLoop);
