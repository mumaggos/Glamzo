const fs = require('fs');
let text = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

text = text.replace(
`        } else {
          // Fallback static high-fidelity seed requests if DB table is empty
          const defaultRequests = [
            { id: 'term-r01', salon: 'Luxe Nails Porto', city: 'Porto', shipping_name: 'Luxe Nails Porto', shipping_phone: '912345678', shipping_address: 'Rua do Bonfim 123', shipping_postal_code: '4000-123', deposit_paid: true, carrier: 'CTT', tracking_code: '', status: 'processing' },
            { id: 'term-r02', salon: 'Barbearia da Linha', city: 'Cascais', shipping_name: 'Barbearia da Linha', shipping_phone: '923456789', shipping_address: 'Avenida Marginal 456', shipping_postal_code: '2750-456', deposit_paid: false, carrier: 'CTT', tracking_code: 'DA123456789PT', status: 'shipped' }
          ];
          setTerminalRequests(defaultRequests);
        }`,
`        } else {
          setTerminalRequests([]);
        }`
);

text = text.replace(
`      } catch (err) {
        // Safe fallback in case of schemas not fully provisioned yet in some preview branches
        const defaultRequests = [
          { id: 'term-r01', salon: 'Luxe Nails Porto', city: 'Porto', shipping_name: 'Luxe Nails Porto', shipping_phone: '912345678', shipping_address: 'Rua do Bonfim 123', shipping_postal_code: '4000-123', deposit_paid: true, carrier: 'CTT', tracking_code: '', status: 'processing' },
          { id: 'term-r02', salon: 'Barbearia da Linha', city: 'Cascais', shipping_name: 'Barbearia da Linha', shipping_phone: '923456789', shipping_address: 'Avenida Marginal 456', shipping_postal_code: '2750-456', deposit_paid: false, carrier: 'CTT', tracking_code: 'DA123456789PT', status: 'shipped' }
        ];
        setTerminalRequests(defaultRequests);
      }`,
`      } catch (err) {
        setTerminalRequests([]);
      }`
);

fs.writeFileSync('src/pages/Admin.tsx', text);
