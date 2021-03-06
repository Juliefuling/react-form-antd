import React, {
    useState,
    forwardRef, useCallback,
    useEffect
} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import get from 'lodash/get';
import './assets/index.scss';
import ReactForm, {useApi as _useApi} from '@kne/react-form';
import {Provider} from './context';

export * from '@kne/react-form';

export {default as useChangeDecorator} from './hooks/useChangeDecorator';
export {default as useBlurDecorator} from './hooks/useBlurDecorator';
export {useOnChange, useOnBlur, default as useDecorator} from './hooks/useDecorator';
export {default as useUIDecorator} from './hooks/useUIDecorator';
export const useApi = _useApi;


const isElementInViewport = (el, offset = 0) => {
    const box = el.getBoundingClientRect(),
        top = box.top >= 0,
        left = box.left >= 0,
        bottom =
            box.bottom <=
            (window.innerHeight || document.documentElement.clientHeight) + offset,
        right =
            box.right <=
            (window.innerWidth || document.documentElement.clientWidth) + offset;
    return top && left && bottom && right;
};

const ScrollToError = () => {
    const {emitter, fieldList, getValidateInfo} = useApi();
    useEffect(() => {
        const token = emitter.addListener('check', (isPass, {isForce}) => {
            if (isForce === true && isPass === false) {
                const info = getValidateInfo();
                const firstError = Object.keys(info).find(
                    name => info[name].result === false
                ), field = get(fieldList.current, `[${firstError}].field`);
                if (firstError && field) {
                    const el = field.current.fieldRef.current;
                    !isElementInViewport(el) && el.scrollIntoView();
                }
            }
        });

        return () => {
            token.remove();
        };
    }, [emitter, fieldList, getValidateInfo]);
    return null;
};

const EnterSubmit = ({enterSubmit, ...props}) => {
    const {submit} = useApi();
    const handlerKeyUp = useCallback((e) => {
        if (e.keyCode === 13 && enterSubmit) {
            submit();
        }
    }, [submit, enterSubmit]);
    return <div {...props} onKeyUp={handlerKeyUp}/>
};

const Form = forwardRef(({className, enterSubmit, scrollToError, type, size, children, ...props}, ref) => {
    const [maxLabelWidth, setMaxLabelWidth] = useState(0);

    let computedClass = 'react-form';
    if (type !== 'default') {
        computedClass += `--${type}`;
    }

    if (size !== 'default') {
        computedClass += `--${size}`;
    }
    return (
      <form onSubmit={(e)=>e.preventDefault()}>
          <ReactForm {...props} ref={ref}>
              <Provider value={{maxLabelWidth, setMaxLabelWidth}}>
                  <EnterSubmit className={classnames(computedClass, className)} enterSubmit={enterSubmit}>
                      {scrollToError ? <ScrollToError/> : null}
                      {children}
                  </EnterSubmit>
              </Provider>
          </ReactForm>
      </form>
    );
});

Form.defaultProps = {
    type: 'default',
    size: 'default',
    scrollToError: true,
    enterSubmit: false
};

Form.propTypes = {
    className: PropTypes.string,
    type: PropTypes.oneOf(['inline', 'default', 'inner']),
    size: PropTypes.oneOf(['small', 'default', 'large']),
    enterSubmit: PropTypes.bool,
    scrollToError: PropTypes.bool
};

export default Form;
