import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';

export default function withAuth(Component) {
  return function AuthWrapper(props) {
    const router = useRouter();

    useEffect(() => {
      const token = Cookies.get('token');
      if (!token) router.push('/login');
    }, [router]);

    return <Component {...props} />;
  };
}
