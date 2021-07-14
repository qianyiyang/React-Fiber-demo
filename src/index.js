// import React from "react";
// import ReactDOM from "react-dom";

// const element = (
//     <div id='A1'>
//         <div id='B1' className='B11'>
//             <div id='C1'></div>
//             <div id='C11'></div>
//         </div>
//         <div id='B2' className='B11'>
//             <div id='C2'></div>
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

// 下一个工作单元
let nextUnitOfWork = {
    stateNode: container, // 此fiber对应的dom节点
    props: {
        children: [element],
    },
};

function workLoop() {
    // 存在下一个工作单元时执行,并返回下一个工作单元
    while (nextUnitOfWork) {
        nextUnitOfWork = performanceUnitOfWork(nextUnitOfWork);
    }
}

/**
 * beginWork 1. 创建FIber的真实DOM,通过虚拟DOM创建Fiber树结构
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
        completeUnitOfWork();
        if (workInProgressFiber.sibling) {
            return workInProgressFiber.sibling;
        }

        workInProgressFiber = workInProgressFiber.return;
    }
}

function beginWork(workInProgressFiber) {
    console.log("beginWork", workInProgressFiber);

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
    workInProgressFiber.props.children.forEach((item, index) => {
        let childFiber = {
            type: item.type,
            props: item.props,
            return: workInProgressFiber,
            effectTag: "PLACEMENT",
        };
    });
}

function completeUnitOfWork(workInProgressFiber) {
    console.log("completeUnitOfWork", workInProgressFiber);
}

// 浏览器空闲时执行
requestIdleCallback(workLoop);
