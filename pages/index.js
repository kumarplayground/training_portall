import Link from 'next/link'
import Image from 'next/image'

export default function Home(){
  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{textAlign:'center'}}>
          <Image src="/SMG.jpg" alt="HR Portal" className="logo" width={88} height={88} />
        <h1>Training Portal</h1>
        <div style={{marginTop:20}}>
          <Link href="/admin/login"><button style={{marginRight:10}}>Admin Login</button></Link>
          <Link href="/candidate/login"><button>Candidate Login</button></Link>
        </div>
      </div>
    </div>
  )
}
