// Module scope
/*
common/ball/t,x,y,z,vx,vy,vz,v,h,n;
common/fielder/xx,yy,vvx,vvy,vv;
*/

function init_2darray(n, m, val) {
  var arr = Array(n);
  for (var i = 0; i < n; i++) {
    arr[i] = Array(m).fill(val);
  }
  return arr;
}

export function Outfielder() {

  // declarations
  var m, circ, vmph, theta, phi, phifinal, k, a, area, dd, alpha, rr, ttilde, gamm, Vprime;
  var tau, tau0, tau1, tau2, dt, tempF, elevft, RH, pressurein, beta, pi, h, hmax, phiR, tmax, dmax;
  var wb, wg, ws, temp, elev, pressure, SVP, rhoSI, rhoI, tc, xc, yc, zc, psi;
  var wx, wy, wz, w, wpar, wperp, g, Cd, Cm, S, ax, ay, az, ww;
  var deltaphi0, xx0, yy0, Vtmax, Vt, phiTP, rad, ds;
  var dptplane, ang, deltat;
  var b, i, n, c, ic, n0;

  const NMAX = 1000;

  // arrays
  var t = Array(NMAX).fill(0.0);
  var x = Array(NMAX).fill(0.0);
  var y = Array(NMAX).fill(0.0);
  var z = Array(NMAX).fill(0.0);
  var d = Array(NMAX).fill(0.0);
  var vx = Array(NMAX).fill(0.0);
  var vy = Array(NMAX).fill(0.0);
  var vz = Array(NMAX).fill(0.0);
  var v = Array(NMAX).fill(0.0);
  var xx = init_2darray(3, NMAX, 0.0);
  var yy = init_2darray(3, NMAX, 0.0);
  var vvx = init_2darray(3, NMAX, 0.0);
  var vvy = init_2darray(3, NMAX, 0.0);
  var vv = init_2darray(3, NMAX, 0.0);
  var Dist = Array(3).fill(0.0);
  var Vave = Array(3).fill(0.0);

  // calculation inputs

  pi = 3.1415926535897932384626;     // pi  
  dt = 0.01;                         // time step (s)

  // ball inputs

  m = 5.125;         // ball mass (oz)
  circ = 9.125;      // ball circumference (inches)
  x[0] = 0.0;        // initial ball position when it exits the bat (ft)
  y[0] = 0.0;         
  z[0] = 3.0;
  t[0] = 0.0;         // initial time
  h = 5.0;           // final height of the ball when it is caught (ft)
  vmph = 100.0;       // ball exit speed (mph)
  theta = 30.0;       // launch angle of the ball above the horizontal (degrees)
  phi =   0.0;       // initial bearing angle of the ball measured horizontally to the right of the y axis (degrees)
  b = 1;               // batter handedness (1 = right hand, -1 = left hand)
    
  // fielder inputs

  xx0 = -50.0;        // initial fielder position (ft)
  yy0 = 500.0;        // RF: (220,300) CF: (38,410) LF: (-200,370)
  tau = 0.0;         // response time (s) (if tau1 > 0 and tau2 > 0, then set tau = 0)
  tau1 = 0.5;        // initial time delay constant 1 (s) (If tau > 0, then set tau1 = tau2 = 0)
  tau2 = 1.5;        // initial time delay constant 2 (s)
  deltaphi0 = 5.0;    // angle spread delta phi_0 for initial response time calculation (deg)
  gamm = 1.0;        // fielder sprint time constant (gamma, 1/s)
  //    Vtmax = 1000000.0;   // maximum terminal velocity of fielder (ft/s)
  Vtmax = 30.0;      // maximum terminal velocity of fielder (ft/s)
  
  // field inputs

  tempF = 70.0;          // air temperature (degrees Farenheit)
  elevft = 15.0;         // field elevation (ft above sea level)
  RH = 50.0;             // air relative humidity (%)
  pressurein = 29.92;    // air barometric pressure (inches of Hg)
  beta = 0.0001217;      // air pressure decay constant (1/m)
  g = 32.174;            // acceleration of gravity (ft/s^2)
  ds = 1.0;               // set ds = 1 to include drag and spin in calculating the ball trajectory, and set ds = 0 to ignore them
    
  // ball initializations

  a = circ/2/pi/12.0;                 // ball radius (ft)
  area = pi*a*a;                     // ball cross sectional area (ft^2)
  v[0] = vmph*5280.0/3600.0;       // ball exit speed (ft/s) (Nathan writes v = vmph*1.467)
  d[0] = 0.0;
  wb = -763 + 120*theta + 21*phi*b;  // initial backspin of the ball (rpm, positive for backspin and negative for topspin)
  ws = -b*849 - 94*phi;              // initial sidespin of the ball (rpm, positive for balls swerving toward the left field foul line)
  wg = 0.0;                        // initial gyrospin of the ball about the velocity axis (rpm)
  w = Math.sqrt(wb**2+ws**2+wg**2);       // ball spin magnitude (constant, rpm)
  vx[0] = v[0]*Math.cos(theta*pi/180)*Math.sin(phi*pi/180);  // exit velocity components (ft/s)
  vy[0] = v[0]*Math.cos(theta*pi/180)*Math.cos(phi*pi/180); 
  vz[0] = v[0]*Math.sin(theta*pi/180);
  wx =  wb*Math.cos(phi*pi/180)-ws*Math.sin(theta*pi/180)*Math.sin(phi*pi/180)+wg*vx[0]/v[0]; // ball Cartesian spin components (constant, rpm)
  wy = -wb*Math.sin(phi*pi/180)-ws*Math.sin(theta*pi/180)*Math.cos(phi*pi/180)+wg*vy[0]/v[0];
  wz =  ws*Math.cos(theta*pi/180)+wg*vz[0]/v[0]    
  
  // field initializations

  temp = (5.0/9.0)*(tempF-32);           // air temperature (degrees Celsius)
  elev = elevft/3.2808;                    // field elevation (m above sea level)
  pressure = pressurein*1000/39.37;          // air barometric pressure (mm of Hg)
  SVP = 4.5841*Math.exp((18.687-temp/234.5)*temp/(257.14+temp));  // air saturation vapor pressure (mm of Hg)
  rhoSI = 1.2929*(273/(temp+273)*(pressure*Math.exp(-beta*elev)-0.3783*RH*SVP/100)/760); // air mass density (kg/m^3)
  rhoI = rhoSI*0.06261;                    // air mass density (lb/ft^3)
  k = rhoI*area*16/2/m;                      // force constant (1/ft) (Nathan writes k = 0.07182*rhoI*(5.125/m)*(circ/9.125)**2.)

  // calculate baseball trajectory

  hmax = 0.0;                                     // initialize the maximum height of the ball
  tc = 0.0;                                       // initialize the hang time (total time the ball is in the air)
  i = 0;                                           // initialize the step count
  while (tc == 0.0) {                           // finish finding variables at the current time step
    v[i] = Math.sqrt(vx[i]**2 + vy[i]**2 + vz[i]**2);   // ball speed
    wpar = (vx[i]*wx + vy[i]*wy + vz[i]*wz)/v[i];  // component of the ball's angular velocity that is parallel to its velocity
    wperp = Math.sqrt(w**2-wpar**2);                    // component of the ball's angular velocity that is perpendicular to its velocity
    S = pi*a*wperp/30/v[i];                        // spin factor
    Cd = 0.3008 + 0.0000292*wperp;               // drag coefficient
    Cm = 1.12*S/(0.583+2.333*S);             // Magnus coefficient
    ax =    -ds*k*Cd*v[i]*vx[i] + ds*k*Cm*(wy*vz[i]-wz*vy[i])*v[i]/wperp;  // acceleration
    ay =    -ds*k*Cd*v[i]*vy[i] + ds*k*Cm*(wz*vx[i]-wx*vz[i])*v[i]/wperp;
    az = -g -ds*k*Cd*v[i]*vz[i] + ds*k*Cm*(wx*vy[i]-wy*vx[i])*v[i]/wperp;  // print variables after this step
    i = i + 1;                                     // increment step count
    
    if (i > NMAX) {
      console.log("ball trajectory overflow");
      return;
    }

    t[i] = dt*i;                                   // increment time
    x[i] = x[i-1] + vx[i-1]*dt + 0.5*ax*dt*dt;   // calculate new ball position
    y[i] = y[i-1] + vy[i-1]*dt + 0.5*ay*dt*dt;
    z[i] = z[i-1] + vz[i-1]*dt + 0.5*az*dt*dt;
    d[i] = Math.sqrt(x[i]**2+y[i]**2);

    if (z[i] > hmax) {
      hmax = z[i];                                 // update maximum height
      tmax = t[i];
      dmax = Math.sqrt(x[i]**2+y[i]**2);
    }
    vx[i] = vx[i-1] + dt*ax;                       // calculate new ball velocity
    vy[i] = vy[i-1] + dt*ay;
    vz[i] = vz[i-1] + dt*az;

    if (z[i] < h && z[i-1] > h) {         // the ball descends below the final height h; interpolate landing position
      tc = t[i-1] + (h-z[i-1])*dt/(z[i]-z[i-1]);   // time at which the ball passes through the final height
      xc = x[i-1] + (x[i]-x[i-1])*(tc-t[i-1])/dt;  // ball position at time of catch
      yc = y[i-1] + (y[i]-y[i-1])*(tc-t[i-1])/dt;
      zc = h;
      t[i] = tc;                                   // store landing time and position as the last entry in the arrays
      ic = i;
      x[i] = xc;
      y[i] = yc;
      z[i] = zc;
      phifinal = Math.atan(xc/yc)*180/pi;               // ball bearing angle at time of catch
      d[i] = Math.sqrt(xc**2+yc**2);                    // ball horizontal distance from home plate at time of catch
      ang = Math.abs(phifinal-phi)*pi/180;
      dptplane = d[i]*Math.sin(ang);                    // distance from landing point to initial plane of motion
//      console.log(tc, d[i], hmax, tmax, dmax, phifinal, xc, yc, wb, ws, dptplane);
    }
  }

  return {t, x, y, z, tc};

  // fielder initializations
/*
  n = tau/dt;                                            // number of time steps of response time (hundredths of a second for dt = 0.01 s)
  phiR = Math.atan2(xx0,yy0)*180.0/pi;                       // bearing angle of initial position vector of fielder (deg)
  tau0 = tau1 + tau2*Math.exp(-(phiR-phi)**2/deltaphi0**2);   // initial time delay (s)
  n0 = tau0/dt;                                          // number of time steps of initial time delay (hundredths of a second for dt = 0.01 s)
  if (n+n0 > NMAX) {
    console.log("n+n0 > NMAX");
    return;
  }
  if (z(n0) < h) { // hold the fielder stationary until the ball is at or above the horizontal direction
    i = 1;
    while (z(n0+i) < h) {
      i = i + 1;
    }
    n0 = n0 + i; // increase the initial delay time n0 so that the z(n0) is greater than or equal to h
  }
  for(c = 1; c <= 3; c++) {    // keep the fielder at his initial position during the response time and the initial delay time
    dist(c) = 0.0;
    for (i = 0; i <= n + n0; i++) {
      xx(c,i) = xx0;
      yy(c,i) = yy0;
      vvx(c,i) = 0.0;
      vvy(c,i) = 0.0;
    }
  }

  //---------------------------------------
  // determine TP fielder motion (c = 1)
  c = 1;
  ttilde = (n+n0)*dt;                      // time when fielder starts accelerating from rest (s)
  dd = Math.sqrt((xc-xx0)**2+(yc-yy0)**2);      // initial horizontal distance from fielder to ball (ft)
  phiTP = Math.atan2(xc-xx0,yc-yy0);            // bearing angle of fielder to ball (measured to the right of the y axis)
  Vt = gamm*dd/(Math.exp(-gamm*(tc-ttilde)) - 1.0 + gamm*(tc-ttilde)); // terminal speed (ft/s)
  if (Vt > Vtmax) {
    console.log(Vt, Vtmax, "TP unsuccessful");
    Vt = Vtmax;
  }

  for (i = n + n0 + 1; i <= ic; i++) {
    rr = Vt*(t[i]-ttilde) + Vt*(Math.exp(-gamm*(t[i]-ttilde)) - 1.0)/gamm;
    vv(c,i) = Vt*(1-Math.exp(-gamm*(t[i]-ttilde)));
    xx(c,i) = xx0 + rr*Math.sin(phiTP);
    yy(c,i) = yy0 + rr*Math.cos(phiTP);
    vvx(c,i) = vv(c,i)*Math.sin(phiTP);
    vvy(c,i) = vv(c,i)*Math.cos(phiTP);
  }
  Dist(c) = Math.sqrt((xx(c,ic)-xx0)**2 + (yy(c,ic)-yy0)**2);
  Vave(c) = Dist(c)/(tc-ttilde);
    

  //---------------------------------------
  // determine OAC (c = 2) and AAC (c = 3) fielder motion
    
    do c = 2, 3
      i = n + n0                                        // time when fielder starts accelerating from rest
      call setangles(c,i,ww,psi,alpha)
      do i = n + n0 + 1, ic
        if (c .eq. 2) then
          alpha = alpha + ww*(t[i]-t[i-1])*(Math.cos(alpha))**2
        else
          alpha = alpha + ww*(t[i]-t[i-1])
        endif
        dd = (z(i-n)-h)/Math.tan(alpha)                      // new fielder-ball distance
        xx(c,i) = x(i-n) + dd*Math.sin(psi)                  // new fielder position
        yy(c,i) = y(i-n) + (xx(c,i)-x(i-n))/Math.tan(psi)
        vvx(c,i) = (xx(c,i)-xx(c,i-1))/(t[i]-t[i-1])    // new fielder velocity
        vvy(c,i) = (yy(c,i)-yy(c,i-1))/(t[i]-t[i-1])
        vv(c,i) = Math.sqrt(vvx(c,i)**2 + vvy(c,i)**2)
        deltat = t[i]-t[i-1]
        if (vv(c,i).gt.vv(c,i-1)) then                  // fielder speed is increasing with time
          Vprime = Vtmax - (Vtmax-vv(c,i-1))*Math.exp(-gamm*(t[i]-t[i-1]))
          if (vv(c,i).gt.Vprime) then
            call scalecoordinates(c,i,deltat,Vprime)
            call setangles(c,i,ww,psi,alpha)
          endif
        else                                            // fielder speed is decreasing with time
          Vprime = Vtmax - (Vtmax-vv(c,i-1))*Math.exp(gamm*(t[i]-t[i-1]))
          if (vv(c,i).lt.Vprime) then
            call scalecoordinates(c,i,deltat,Vprime)
            call setangles(c,i,ww,psi,alpha)
          endif
        endif
        Dist(c) = Dist(c) + Math.sqrt((xx(c,i)-xx(c,i-1))**2 + (yy(c,i)-yy(c,i-1))**2)
      enddo
      Vave(c) = Dist(c)/(tc-ttilde)
    enddo
*/
// output results
/*
  for (c = 1; c <= 3; c++) {
    write (*,'(90(f12.6,","))') Dist(c), Vave(c)
  }
  open(file="output.csv",unit=11,status="unknown")
  write (11,*)"t, x, y, z, d, X1, Y1, Vx1, Vy1, V1, X2, Y2, Vx2, Vy2, V2, X3, Y3, Vx3, Vy3, V3"
  do i = 0, ic
  write (11,'(90(f12.6,","))') t[i], x[i], y[i], z[i], d[i], xx(1,i), yy(1,i), vvx(1,i), vvy(1,i), vv(1,i), &
    xx(2,i), yy(2,i), vvx(2,i), vvy(2,i), vv(2,i), xx(3,i), yy(3,i), vvx(3,i), vvy(3,i), vv(3,i)
  enddo
  close(unit=11)
*/
}

  /*
subroutine setangles(c,i,ww,psi,alpha)
    implicit none
    integer c, i, n, NMAX
    parameter (NMAX=1000)                                           // allow for hang times of up to 10 seconds
    var t(0:NMAX), x(0:NMAX), y(0:NMAX), z(0:NMAX)     // ball positions
    var vx(0:NMAX), vy(0:NMAX), vz(0:NMAX), v(0:NMAX)  // ball velocities
    var xx(3,0:NMAX), yy(3,0:NMAX)                     // fielder positions; 1 = TP, 2 = OAC, 3 = AAC
    var vvx(3,0:NMAX), vvy(3,0:NMAX), vv(3,0:NMAX)     // fielder velocities
    var dd, dddot, ll, ww, psi, alpha, h
    common/ball/t,x,y,z,vx,vy,vz,v,h,n
    common/fielder/xx,yy,vvx,vvy,vv
    dd = Math.sqrt((x(i-n)-xx(c,i))**2 + (y(i-n)-yy(c,i))**2) // horizontal distance D between fielder and previous ball position
    ll = Math.sqrt(dd**2 + (z(i-n)-h)**2) // total distance L between fielder and previous ball position
    dddot = ((x(i-n)-xx(c,i))*(vx(i-n)-vvx(c,i)) + (y(i-n)-yy(c,i))*(vy(i-n)-vvy(c,i)))/dd // time derivative of D
    if (c .eq. 2) then
      ww = (vz(i-n)*dd - dddot*(z(i-n)-h))/dd**2 // OAC Omega based on previous position of ball and current position of fielder
    else 
      ww = (vz(i-n)*dd - dddot*(z(i-n)-h))/ll**2 // AAC Omega based on previous position of ball and current position of fielder
    endif
    psi = Math.atan2(xx(c,i)-x(i-n),yy(c,i)-y(i-n)) // azimuthal angle of ball based on ...
    alpha = Math.atan2(z(i-n)-h,dd)                 // time-delayed elevation angle of ball based on ...
    return
    end
    
subroutine scalecoordinates(c,i,deltat,Vprime)
    implicit none
    integer c, i, NMAX
    parameter (NMAX=1000)                                           // allow for hang times of up to 10 seconds
    var eta, Vprime, deltat
    var xx(3,0:NMAX), yy(3,0:NMAX)                     // fielder positions; 1 = TP, 2 = OAC, 3 = AAC
    var vvx(3,0:NMAX), vvy(3,0:NMAX), vv(3,0:NMAX)     // fielder velocities
    common/fielder/xx,yy,vvx,vvy,vv
    eta = Vprime/vv(c,i)
    vv(c,i) = eta*vv(c,i)
    vvx(c,i) = eta*vvx(c,i)
    vvy(c,i) = eta*vvy(c,i)
    xx(c,i) = xx(c,i-1) + deltat*vvx(c,i)
    yy(c,i) = yy(c,i-1) + deltat*vvy(c,i)
    return
    end

*/
