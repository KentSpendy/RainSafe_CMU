https://react-hot-toast.com/docs

<!-- intallation -->

npm install react-hot-toast

<!-- basic usage -->

import toast, { Toaster } from 'react-hot-toast';

const notify = () => toast('Here is your toast.');

const App = () => {
return (
<div>
<button onClick={notify}>Make me a toast</button>
<Toaster />
</div>
);
};


Toaster /> API
This component will render all toasts. Alternatively you can create own renderer with the headless useToaster() hook.

Available options
<Toaster
  position="top-center"
  reverseOrder={false}
  gutter={8}
  containerClassName=""
  containerStyle={{}}
  toasterId="default"
  toastOptions={{
    // Define default options
    className: '',
    duration: 5000,
    removeDelay: 1000,
    style: {
      background: '#363636',
      color: '#fff',
    },

    // Default options for specific types
    success: {
      duration: 3000,
      iconTheme: {
        primary: 'green',
        secondary: 'black',
      },
    },
  }}
/>
position Prop
You can change the position of all toasts by modifying supplying positon prop.

Positions		
top-left	top-center	top-right
bottom-left	bottom-center	bottom-right
reverseOrder Prop
Toasts spawn at top by default. Set to true if you want new toasts at the end.

containerClassName Prop
Add a custom CSS class name to toaster div. Defaults to undefined.

containerStyle Prop
Customize the style of toaster div. This can be used to change the offset of all toasts

gutter Prop
Changes the gap between each toast. Defaults to 8.

toasterId Prop
You can change the toasterId to have a different toaster instance. Learn more about multiple toasters. Defaults to "default".

toastOptions Prop
These will act as default options for all toasts. See toast() for all available options.

Type specific options
You can change the defaults for a specific type by adding, success: {}, error: {}, loading: {} or custom: {}.

Using a custom render function
You can provide your own render function to the Toaster by passing it as children. It will be called for each Toast allowing you to render any component based on the toast state.

Minimal example
import { Toaster, resolveValue } from 'react-hot-toast';

// In your app
<Toaster>
  {(t) => (
    <div
      style={{ opacity: t.visible ? 1 : 0, background: 'white', padding: 8 }}
    >
      {resolveValue(t.message, t)}
    </div>
  )}
</Toaster>;
resolveValue() is needed to resolve all message types: Text, JSX or a function that resolves to JSX.

Adapting the default <ToastBar/>
You can use this API to modify the default ToastBar as well. In this example we overwrite the animation style based on the current state.

import { Toaster, ToastBar } from 'react-hot-toast';

<Toaster>
  {(t) => (
    <ToastBar
      toast={t}
      style={{
        ...t.style,
        animation: t.visible
          ? 'custom-enter 1s ease'
          : 'custom-exit 1s ease forwards',
      }}
    />
  )}
</Toaster>;



<ToastBar /> API
This is the default toast component rendered by the Toaster. You can use this component in a Toaster with a custom render function to overwrite its defaults.

Available options
<ToastBar
  toast={t}
  style={{}} // Overwrite styles
  position="top-center" // Used to adapt the animation
/>



Add custom content
You can add a render function to the ToastBar to modify its content. An object containing The icon as well as the message are passed into the function.

Add a dismiss button
In this example we add a basic dismiss button to all toasts, except if the loading one.

import { toast, Toaster, ToastBar } from 'react-hot-toast';

<Toaster>
  {(t) => (
    <ToastBar toast={t}>
      {({ icon, message }) => (
        <>
          {icon}
          {message}
          {t.type !== 'loading' && (
            <button onClick={() => toast.dismiss(t.id)}>X</button>
          )}
        </>
      )}
    </ToastBar>
  )}
</Toaster>;