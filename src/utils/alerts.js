import Swal from 'sweetalert2';

export const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  }
});

export const showSuccessToast = (title) => {
  Toast.fire({
    icon: 'success',
    title: title
  });
};

export const showErrorToast = (title) => {
  Toast.fire({
    icon: 'error',
    title: title
  });
};

export const showConfirmDialog = async ({ title, text, confirmButtonText = 'Yes, Confirm' }) => {
  return await Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#0066d6',
    cancelButtonColor: '#ef4444',
    confirmButtonText,
    borderRadius: '16px',
    customClass: {
      popup: 'rounded-2xl shadow-2xl border border-slate-100',
      title: 'text-lg font-bold text-slate-900',
      confirmButton: 'rounded-xl px-5 py-2.5 font-semibold text-sm',
      cancelButton: 'rounded-xl px-5 py-2.5 font-semibold text-sm'
    }
  });
};

