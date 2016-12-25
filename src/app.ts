import { DomSource, VNode, div, h2, svg, p, img } from '@motorcycle/dom';
import { Styles } from './app.styles';
import { normalize, setupPage } from 'csstips';
import { scaleLinear } from 'd3-scale';

import { Stream, skip, scan, periodic, combineArray } from 'most';

import animationFrames from './animationFrames';

export const interval = (period: number) =>
    skip(1, scan((x, y) => x + y, -1, periodic(period, 1))) as Stream<number>;

import { Pythagoras } from './pythagoras';

normalize();
setupPage('#app');

export type Sources = {
    DOM: DomSource;
}

export type Sinks = {
    DOM: Stream<VNode>;
}

const svgDimensions = {
    width: 1280,
    height: 600
}

const realMax = 11;

export function App(sources: Sources): Sinks {
    const factorAndLean$ = sources.DOM.select('#the-svg').events('mousemove')
        .map((mouseEvent: MouseEvent) => {
            const { offsetX: x, offsetY: y } = mouseEvent;
            const scaleFactor = scaleLinear().domain([svgDimensions.height, 0]).range([0, .8]);
            const scaleLean = scaleLinear().domain([0, svgDimensions.width / 2, svgDimensions.width]).range([.5, 0, -.5]);
            return {
                heightFactor: scaleFactor(y),
                lean: scaleLean(x)
            };
        })
        .startWith({ heightFactor: 0, lean: 0 });

    const args$ = combineArray(({ heightFactor, lean }, maxlvl) => ({
        w: 80,
        heightFactor,
        lean,
        x: svgDimensions.width / 2 - 40,
        y: svgDimensions.height - 80,
        lvl: 0,
        maxlvl,
        left: false,
        right: false
    }), [
            factorAndLean$, interval(500).take(realMax)
        ]);

    const pythagoras$ = Pythagoras(args$);

    const vtree$ = pythagoras$.map(x =>
        div(Styles.App, [
            div(Styles.AppHeader, [
                img(Styles.AppLogo, { props: { src: 'cyclejs_logo.svg' } }),
                h2('This is a dancing Pythagoras tree')
            ]),
            p(Styles.AppIntro, [
                svg('#the-svg', { attrs: { height: svgDimensions.height, width: svgDimensions.width, style: 'border: 1px solid lightgray' } }, [x])
            ])
        ])
    );

    return {
        DOM: vtree$.sampleWith<VNode>(animationFrames()),
    };
}
