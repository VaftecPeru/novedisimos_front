import Swal from 'sweetalert2';

export function useConfirmDialog() {
  const confirm = async ({
    title = '¿Estás seguro?',
    text = '',
    icon = 'warning',
    confirmButtonText = 'Sí',
    cancelButtonText = 'Cancelar',
    confirmButtonColor = '#4763e4',
    cancelButtonColor = '#d33',
  }) => {
    const result = await Swal.fire({
      title,
      text,
      icon,
      showCancelButton: true,
      confirmButtonColor,
      cancelButtonColor,
      confirmButtonText,
      cancelButtonText,
    });
    return result.isConfirmed;
  };

  return { confirm };
}